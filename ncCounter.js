/* ncCounter by Hibi. v2.0.1
 * This software is placed in public domain. In jurisdictions that do not
 * recognize public domain, you are free to do anything with it.
 * This script automatically gets your Neocities website name to poll
 * statistics about it.
 * A third party CORS proxy is  used, but is configurable at line 45.
 *
 * Usage:
 * Include this script, 
 * .ncCounter -> defines a counter container
 * .ncHits -> blank space for number of hits
 * .ncViews -> blank space for number of unique views
 * .ncUp -> blank space for time and date last updated
 * .ncUpDate -> blank space for date last updated
 * .ncUpTime -> blank space for time last updated
 * ncCounter.localeDate = true; -> use localized strings
 * ncCounter.LoadData(ncCounterIndex); -> loads data for the specified counter
 *
*/

/* namespace definition */
var ncCounter = {
	
	/* Version information */
	version: "2.0.1",
	
	/* Data returned from the API call, stays undefined on fail or bad site. */
	apiData: undefined,
	
	/* Set to true to provide localized date strings */
	localeDate: false,
	
	/* Should fill apiData once like a singleton's getInstance, also fills the
	 * counters */
	LoadData: function(index) {
		/* Don't call the API again. */
		if (ncCounter.apiData !== undefined) {
			console.log("ncCounter: LoadData: info: data already loaded");
			ncCounter.Fill(index, ncCounter.apiData);
			return;
		}
		/* If we haven't called the API yet... */
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
				console.log("ncCounter: LoadData: info: filling");
				ncCounter.Fill(index, ncCounter.apiData);
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
	Fill: function(index, apiData) {
		
		/* Don't get ahead of ourselves */
		var counter = document.getElementsByClassName("ncCounter")[index];
		if (counter === undefined) {
			console.log("ncCounter: Fill: oops: no or wrong counter!");
			return;
		}

		/* Iterate through each blank */
		var blank;
		
		/* Hits */
		blank = counter.getElementsByClassName("ncHits")[0];
		if (blank !== undefined)
			blank.innerText = apiData.hits;
		/* Views */
		blank = counter.getElementsByClassName("ncViews")[0];
		if (blank !== undefined)
			blank.innerText = apiData.views;
			
		var lastUp = new Date(apiData.last_updated);
		/* Last updated, localized */
		if (ncCounter.localeDate) {
			/* Full string */
			blank = counter.getElementsByClassName("ncUp")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toLocaleString();
			
			/* Date only */
			blank = counter.getElementsByClassName("ncUpDate")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toLocaleDateString();
			
			/* Time only */
			blank = counter.getElementsByClassName("ncUpTime")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toLocaleTimeString();
			
		}
		/* Last updated */
		else {
			/* Full string */
			blank = counter.getElementsByClassName("ncUp")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toString();
			
			/* Date only */
			blank = counter.getElementsByClassName("ncUpDate")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toDateString();
			
			/* Time only */
			blank = counter.getElementsByClassName("ncUpTime")[0];
				if (blank !== undefined)
					blank.innerText = lastUp.toTimeString();
			
		}
		return;
	}
};
