/*jshint browser:true, jquery:true, devel:true */
/*global _:false */

var hiro, main;

(function () {
	"use strict";

	var size = 0;
	var completed = 0;

	hiro = new Hiro();

	main = function () {
		_.each(hiro.suites, function (suite, name) {
			var view = new SuiteView(name, suite);

			view.render();
			view.addListeners();

			size += _.reduce(_.keys(suite.methods), function (memo, name) {
				return memo + (name.slice(0, 4) === "test" ? 1 : 0);
			}, 0);
		});

		$("div.runall").click(function () {
			hiro.run();
		});
	};

	function SuiteView(name, model) {
		this.name = name;
		this.template = $("script[type='hiro/template']").html();
		this.tests = [];

		_.each(model.methods, _.bind(function (func, name) {
			if (name.slice(0, 4) !== "test")
				return;

			this.tests.push(name);
		}, this));
	}

	SuiteView.prototype.render = function () {
		var states = [ "ready", "passed", "failed" ];
		var html = _.template(this.template, {
			suiteName: this.name,
			tests: this.tests
		});

		$("#suite-views").append(html);
	};

	SuiteView.prototype.addListeners = function () {
		var self = this;

		hiro.bind("test.onStart", function (test) {
			var $el = $("#suite-" + self.name + " .test-" + test.name + " .status .label");
			$el.html("RUNNING");
		});

		hiro.bind("test.onComplete", function (test, success, report) {
			var $el = $("#suite-" + self.name + " .test-" + test.name + " .status .label");

			if ($el.length === 0)
				return;

			completed += 1;
			$(".progress .bar").css("width", ((completed / size) * 100) + "%");

			if (success)
				return void $el.addClass("label-success").html("PASS");

			$el.addClass("label-important").html("FAIL");
		});
	};
})();
