// THIS IS INCOMPLETE, WIP
// DON'T USE ME
throw "WHAT DID I TELL YOU";

var mineformat = {
		output: "",

		parser: {

			text: function (object) {
				mineformat.output += object.text;
			},
			translate: function (object) {
				let i = 0;
				for (; i < object.with.length; i++) {
					mineformat.output += mineformat.translation[object.translate][i];
					mineformat.parseNode(object.with[i]);
				}
				mineformat.output += mineformat.translation[object.translate][i];
			}

		},
		parseFormatting: function (object) {
			var style = "";
			var classes = "";
			// color
			if (object.color) {
				if (object.color[0] != '#')
					style += "color:var(--mf-" + object.color + ");";
				else
					style += "color:" + object.color + ";";
			}
			// bold
			if (object.bold)
				classes += "mf-bold ";
			// italic
			if (object.italic)
				classes += "mf-italic ";
			// underlined
			if (object.underlined)
				classes += "mf-underl ";
			// strikethrough
			if (object.strikethrough)
				classes += "mf-strike ";
			// obfustcated
			if (object.obfuscated)
				classes += "mf-obfus ";
			if (style) {
				mineformat.output += "style=\"" + style + "\" ";
			}
			if (classes) {
				mineformat.output += "class=\"" + classes + "\" ";
			}
		},
		parseArray: function (object) {
			for (i in object)
				mineformat.parseNode(object[i]);
		},
		parseNode: function (object) {
			if (object.data != undefined) {
				mineformat.parseArray(object.data);
				return
			}
			mineformat.output += "<span ";
			mineformat.parseFormatting(object);
			mineformat.output += ">";
			if (object.text != undefined) {
				mineformat.parser.text(object);
			}
			if (object.translate != undefined) {
				mineformat.parser.translate(object);
			}
			if (object.extra != undefined)
				mineformat.parseArray(object.extra);
			mineformat.output += "</span>";
		},
		parse: function (string) {
			var object;
			try {
				object = JSON.parse(string);
			} catch (e) { // raw string
				return string;
			}
			mineformat.output = "";
			if (object[0] == undefined) { // a single root node
				mineformat.parseNode(object);
			} else { // it's an array of elements
				mineformat.parseArray(object);
			}
			return mineformat.output;
		},

		translation: {
			"chat.type.text": ["&lt;", "&gt; ", ""],
			"chat.type.emote": ["* "," ",""],
			"chat.type.announcement": ["[","] ",""],
			"chat.type.admin": ["[", ": ","]"],
			"chat.type.advancement.task": [""," has made the advancement ",""],
			"chat.type.advancement.challenge": [""," has completed the challenge ",""],
			"chat.type.advancement.goal": [""," has reached the goal ",""],
			"chat.type.team.text": [""," &lt;","&gt; ",""],
			"chat.type.team.sent": ["-&gt; "," &lt;","&gt; ",""]
		}
	}
