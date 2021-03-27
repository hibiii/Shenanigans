/* ncCounter by Hibi. v3.0.0
 * This software is placed in public domain. In jurisdictions that do not
 * recognize public domain, you are free to do anything with it.
 * This script automatically gets your Neocities website name to poll
 * statistics about it.
 * A third party CORS proxy is  used, but is configurable at line 73.
 *
 * Usage:
 * Include this script, 
 * .ncCounter -> defines a counter container
 * .ncHits -> number of hits
 * .ncViews -> number of unique views
 * .ncUp -> time and date last updated
 *     .ncUp.Date -> date last updated
 *     .ncUp.Time -> time of day last updated
 * .ncThisUp -> time and date of last updated for the current page only
 *     (exactly the same as .ncUp)
 * .ncUsername -> your, the site owner, name
 * ncCounter.localeDate = true; -> use localized strings
 * ncCounter.LoadData(ncCounterIndex); -> loads data for the specified counter
 *
*/

/* namespace definition */
var ncCounter = {
	
	/* Version information */
	version: "3.0.0",
	
	/* Data returned from the API call, stays undefined on fail or bad site. */
	apiData: undefined,
	
	/* Extra data not necessarily from the API */
	extraData: undefined,
	
	/* Set to true to provide localized date strings */
	localeDate: false,
	
	
	/* Should fill apiData once like a singleton's getInstance, also fills the
	 * counters */
	LoadData: function(index) {
		/* Don't call the API more than once. */
		if (ncCounter.apiData !== undefined) {
			console.log("ncCounter: LoadData: info: data already loaded");
			ncCounter.Fill(index, ncCounter.apiData);
			return;
		}
		
		/* Fill extraData if it's empty */
		if(ncCounter.extraData === undefined) {
			ncCounter.extraData = {};
			ncCounter.extraData.pageLastUpdated = new Date(document.lastModified);
			ncCounter.extraData.username = document.domain.split(".")[0];
		}
		
		/* Skip calling the API if we don't need to */ {
			var requiresApiCall = false;
			var counter = document.getElementsByClassName("ncCounter")[index];
			for(var clazz in ncCounter.blankClasses.getClasses())
				if(counter.getElementsByClassName(clazz)[0] && ncCounter.blankClasses[clazz].requiresApiCall) {
					requiresApiCall = true;
					break;
				}
			if(!requiresApiCall) {
				ncCounter.Fill(index);
				return;
			}
		}
		
		/* We will call the API because we need to */
		var domain = document.domain;
		var siteName = domain.split('.')[0];
		var proxy = "https://cors-anywhere.herokuapp.com/";
		
		/* We check if the script is being called from within Neocities. */
		if (!domain.endsWith(".neocities.org")) {
			console.log("ncCounter: LoadData: error: pre-condition not met: " + 
				"neocities hosted website");
			throw "nc_domain_error";
		}
		
		/* Get returned site data and parse it */
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				
				var response = JSON.parse(this.responseText);
				
				/* Error handling */
				if (response.result === "error") {
					console.log("ncCounter: loadData: error: API returned "+
						"error with message: \"" + response.message + "\"");
					throw response.error_type;
				}
				ncCounter.apiData = response.info;
				/* For convenience and GC sake, make a Date out of the updated string */
				if(ncCounter.apiData.last_updated !== undefined) {
					ncCounter.apiData.last_updated = new Date(ncCounter.apiData.last_updated);
				}
				console.log("ncCounter: LoadData: info: filling");
				ncCounter.Fill(index);
				return;
			}
		};
		/* Send the call */
		xhr.open("GET",
			proxy + "https://neocities.org/api/info?sitename=" + siteName);
		xhr.setRequestHeader("Accept", 'application/json');
		xhr.send();
		console.log("ncCounter: LoadData: info: XHR sent");
	},

	/* Fill all the `.ncCounter`s on the page */
	Fill: function(index) {
		
		/* Don't get ahead of ourselves */
		var counter = document.getElementsByClassName("ncCounter")[index];
		if (counter === undefined) {
			console.log("ncCounter: Fill: oops: no or wrong counter!");
			return;
		}

		/* Iterate through each blank class */
		var blank;
		ncCounter.blankClasses.getClasses().forEach((clazz) => {
			blank = counter.getElementsByClassName(clazz)[0];
			if (blank !== undefined)
				blank.innerHTML = ncCounter.blankClasses[clazz].getValue(blank.getAttribute(clazz));
		});
		return;
	},
	
	/* Counter class definitions, in a sort of registry-like pattern */
	blankClasses: {
		/* A counter class needs two things in it:
		 * requiresApiCall -> true if, and only if it does. can be left undefined for false.
		 * getValue() -> must return some bit of HTML. can be just a string as well.
		 */
		ncHits: {
			requiresApiCall: true,
			getValue: function() { return ncCounter.apiData.hits; }
		},
		ncViews: {
			requiresApiCall: true,
			getValue: function() { return ncCounter.apiData.views; }
		},
		ncUp: {
			requiresApiCall: true,
			getValue: function(arg) {
				switch(arg) {
				case "Date":
					if(ncCounter.localeDate)
						return ncCounter.apiData.last_updated.toLocaleDateString();
					return ncCounter.apiData.last_updated.toDateString();
				case "Time":
					if(ncCounter.localeDate)
						return ncCounter.apiData.last_updated.toLocaleTimeString();
					return ncCounter.apiData.last_updated.toTimeString();
				default:
					if(ncCounter.localeDate)
						return ncCounter.apiData.last_updated.toLocaleString();
					return ncCounter.apiData.last_updated.toString();
				}
			}
		},
		ncThisUp: {
			getValue: function(arg) {
				switch(arg) {
				case "Date":
					if(ncCounter.localeDate)
						return ncCounter.extraData.pageLastUpdated.toLocaleDateString();
					return ncCounter.extraData.pageLastUpdated.toDateString();
				case "Time":
					if(ncCounter.localeDate)
						return ncCounter.extraData.pageLastUpdated.toLocaleTimeString();
					return ncCounter.extraData.pageLastUpdated.toTimeString();
				default:
					if(ncCounter.localeDate)
						return ncCounter.extraData.pageLastUpdated.toLocaleString();
					return ncCounter.extraData.pageLastUpdated.toString();
				}
			}
		},
		ncUsername: {
			getValue: function() { return ncCounter.extraData.username; }
		},
		/* Gets all the classes */
		getClasses: function() {
			return Object.getOwnPropertyNames(ncCounter.blankClasses);
		}
	}
};
