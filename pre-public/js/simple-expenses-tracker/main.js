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

// Expenses Factory Service
// This service will take care of keeping track of the expenses and other operations.
// For more on services see the documentation: https://docs.angularjs.org/guide/providers
// You can access the factory from the console by doing: angular.element(document.body).injector().get('Expenses')
app.factory('Expenses', function(){
	var service = {};
	// The id will be a unique identifier, it could come from a server.
	service.entries = [
		{id: 1, description: 'food', amount: 10, date: '2015-10-01'},
		{id: 2, description: 'tickets', amount: 11, date: '2015-10-02'},
		{id: 3, description: 'food', amount: 12, date: '2015-10-03'},
		{id: 4, description: 'phone credit', amount: 13, date: '2015-10-04'},
		{id: 5, description: 'bills', amount: 14, date: '2015-10-05'},
		{id: 6, description: 'food', amount: 15, date: '2015-10-06'}								
	];
	
	// Convert strings to date objects
	service.entries.forEach(function(element){
		element.date = myHelpers.stringToDateObj(element.date);
	});

	// Get the next id. we only need this because we are not connecting to a server.
  	// If you were, normally the backend should return the id of the new element you are creating.
  	// To test use this in the console: angular.element(document.body).injector().get('Expenses').getNewId()
	service.getNewId = function(){
		// If we already have one, increase by 1.
		if(service.newId) {
			service.newId++;
			return service.newId;
		}
		else {
			// Find the largest id value using underscore.js
      		// Documentation for _.max: http://underscorejs.org/#max
			var entryMaxId = _.max(service.entries, function(entry) {
				return entry.id;
			});
			service.newId = entryMaxId.id + 1;
			return service.newId;
		}
	};
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
			entry.id = service.getNewId();	
			service.entries.push(entry);
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
});
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
