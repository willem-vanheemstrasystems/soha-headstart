// App's root module
var app = angular.module('expensesApp', ['ngRoute']);

// Helper
var myHelpers = {
	//from http://stackoverflow.com/questions/2280104/convert-javascript-to-date-object-to-mysql-date-format-yyyy-mm-dd
	dateObjToString: function(dateObj) {
		var year, month, day;
		year = String(dateObj.getFullYear());
		month = String(dateObj.getMonth() + 1);
		if (month.length == 1) {
			month = "0" + month;
		}
		day = String(dateObj.getDate());
		if (day.length == 1) {
			day = "0" + day;
		}
		return year + "-" + month + "-" + day;
	},
	stringToDateObj: function(string) {
		return new Date(string.substring(0,4), string.substring(5,7) - 1, string.substring(8,10));
	}
};

// Define routes for the app, each route defines a template and a controller.
app.config(['$routeProvider', function($routeProvider){
	$routeProvider
		.when('/', {
			templateUrl: 'views/expenses.html',
			controller: 'ExpensesViewController'
		})
		.when('/expenses', {
			templateUrl: 'views/expenses.html',
			controller: 'ExpensesViewController'
		})
		.when('/expenses/new', {
			templateUrl: 'views/expenseForm.html',
			controller: 'ExpenseViewController'
		})
		.when('/expenses/edit/:id', {
			templateUrl: 'views/expenseForm.html',
			controller: 'ExpenseViewController'
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

// See http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
app.config(['$httpProvider', function($httpProvider){
	
	console.log("The app.config httpProvider customization is called.");// For testing only
	
	// Use x-www-form-urlencoded Content-Type
	$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
	/**
	* The workhorse; converts an object to x-www-form-urlencoded serialization.
	* @param {Object} obj
	* @return {String}
	*/
	var param = function(obj) {
		var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
		for(name in obj) {
			value = obj[name];
			if(value instanceof Array) {
				for(i=0; i<value.length; ++i) {
					subValue = value[i];
					fullSubName = name + '[' + i + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			}
			else if(value instanceof Object) {
				for(subName in value) {
					subValue = value[subName];
					fullSubName = name + '[' + subName + ']';
					innerObj = {};
					innerObj[fullSubName] = subValue;
					query += param(innerObj) + '&';
				}
			}
			else if(value !== undefined && value !== null)
			query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
		}
		return query.length ? query.substr(0, query.length - 1) : query;
	};
	// Override $http service's default transformRequest
	$httpProvider.defaults.transformRequest = [function(data) {
		return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
	}];	
}]);

// Expenses Factory Service
// This service will take care of keeping track of the expenses and other operations.
// For more on services see the documentation: https://docs.angularjs.org/guide/providers
// You can access the factory from the console by doing: angular.element(document.body).injector().get('Expenses')
app.factory('Expenses', ['$http', function($http){
	var service = {};
	// The id will be a unique identifier, it comes from a server.
	// NOTE: it requires the $http as an input parameter above.
	service.entries = [];
	
	// HTTP call via AJAX for JSON file of data
	$http.get('data/get_all.json')
		.success(function(data){
			console.log(data);
	      	service.entries = data;
	      	//convert date strings to Date objects
	      	service.entries.forEach(function(element){
	        	element.date = myHelpers.stringToDateObj(element.date);
	      	});			
		})
		.error(function(data,status){
			alert('error retrieving data!: data = ' + data + ', status = ' + status);
		});
	// Get an entry by id, using underscore.js
	service.getById = function(id) {
		// Find retrieves the first entry that passes the condition.
    	// Documentation for _.find() http://underscorejs.org/#find
		return _.find(service.entries, function(entry) {
			return entry.id == id;
		});
	};
	// Update an entry
	service.save = function(entry) {
		var toUpdate = service.getById(entry.id);
		if(toUpdate) {
			// Update
			// Extend will copy the properties of toUpdate into entry
			// Documentation for _.extend() http://underscorejs.org/#extend
			_.extend(toUpdate, entry);
		}
		else {
			// Create
			// Push the new entry to the cloud
		/*	$http.post('data/create.json', entry)
				.success(function(data){
					entry.id = data.newId;
					service.entries.push(entry);
				})
				.error(function(data, status){
					alert('error when creating a new entry');
				});
		*/
			$http({
					withCredentials: false,
					method: 'post',
					url: 'data/create.json',
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					data: entry
				})
				.success(function(data){
					entry.id = data.newId;
					service.entries.push(entry);
				})
				.error(function(data, status){
					alert('error when creating a new entry: data = ' + data + ', status = ' + status);
				});	
		}
	};
	// Remove an entry
	service.remove = function(entry) {
		// Reject will remove the element from the collection if its id matches the element's id provided
		// Documentation for _.reject() http://underscorejs.org/#reject
		service.entries = _.reject(service.entries, function(element) {
			return element.id == entry.id;
		});
	};
	return service;
}]);
// Set home title
app.controller('HomeViewController', ['$scope', function($scope){
	$scope.appTitle = "Simple Expenses Tracker";
}]);

// Listen to all Expenses
// Uses the Expenses service
app.controller('ExpensesViewController', ['$scope', 'Expenses', function($scope, Expenses){
	$scope.expenses = Expenses.entries;
	// Remove expense
	$scope.remove = function(expense){
		Expenses.remove(expense);
	};
	// Watch changes on the Expenses entries (e.g. removed entries)
	$scope.$watch(function() {
		return Expenses.entries
	},
	function(entries) {
		// Refresh the scope for possible changes in entries (e.g. removed entries)
		$scope.expenses = entries;
	});
}]);

// Create or Edit an Expense
// Uses the Expenses service
app.controller('ExpenseViewController', ['$scope', '$routeParams', '$location', 'Expenses', function($scope, $routeParams, $location, Expenses){
	// The expense will either be a new one or existing one if we are editing
	if(!$routeParams.id) {
		// Create
		$scope.expense = {date: new Date()};
	}
	else {
		// Update
		// Use clone in order to not manipulate the original object, in case we decide to cancel the update.
		// Clone makes a copy of an object, so we don't modify the real object before clicking Save.
		// Documentation for _.clone() http://underscorejs.org/#clone
		$scope.expense = _.clone(Expenses.getById($routeParams.id));
	}
	$scope.save = function() {
		Expenses.save($scope.expense);
		$location.path('/');
	}
}]);
// Incorporates the custom directive <exp-expense> in the html document
app.directive('expExpense', function() {
	return {
		restrict: 'E',
		//template: '<div>{{expense.description}} - {{expense.amount}}</div>',
		templateUrl: 'views/expense.html'
	}
});
