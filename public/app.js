/*
 * Copyright IBM Corp. 2016, 2017
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
*/


// create the root app module
const module = angular.module('SampleArticleMagazine', ['ui.router'])


// Setup the angular routes for displaying article cards based on which tab is clicked
module.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', function ($httpProvider, $stateProvider, $urlRouterProvider) {

	// default view
	$urlRouterProvider.otherwise('/home');

	$stateProvider

		// home page
		.state('home', {
			url: '/home',
			template: '<article-cards></article-cards>'
		})

		// shows cards for the category name specified
		.state('cards', {
			url: '/:category',
			template: '<article-cards></article-cards>'
		})

		// shows all the information for the content item specified in the item parameter
		.state('cards.details', {
			url: '/:itemName',
			template: '<article-details></article-details>',
			params: { item: null }
		});
}]);


// always start on the home page
module.run(['$state', function ($state) {
	$state.transitionTo('home');
}]);


// Angular factory which accesses WCH
module.factory('wchService', ['$http', function ($http) {

    // The API URL, along with the host and content hub id for your tenant, may be
    // found in the "Hub Information" dialog off the "User menu" in the authoring UI
    // Update the following URL with the value from that Hub Information dialog.
    const baseTenantAPIURL = "https://content-us-7.content-cms.com/api/99086a1e-abe7-4750-8c7b-29b6af82c2f1";

	/**
	* Get the base url which includes the tenant id
	* @return {String}
	*/
	function getBaseURL() {
		return baseTenantAPIURL;
	}


	/**
	* Retrieves the categories under an Article or 'Sample Article' taxonomy
	* @param {String} id: The string id of the taxonomy
	* @return {Promise} resolves to an Array of category Objects
	*/
	function getArticleCategories() {
        return $http({
                method: 'GET',
                url: baseTenantAPIURL + '/delivery/v1/search?q=*:*&fl=id,name&fq=classification:(category)&fq=path:(%5C/Article/* OR %5C/Sample%5C Article/*)'
            }).then(response => {
                return response.data.documents;
            });
	}

	/**
	* Retrieves the ID for the taxonomy with a given name
	* @param {String} category: The string name of the taxonomy to fetch
	* @return {Promise} resolves to an array of content item Objects
	*/
	function getContentItemsByCategoryName(categoryName) {
		return $http({
				method: 'GET',
				url: baseTenantAPIURL + '/delivery/v1/search?q=*:*&wt=json&fq=type%3A(Page contents)&fq=classification:(content)&fl=id,document&fq=categories:(Article/' + categoryName + ' OR Sample%5C Article/' + categoryName + ')&sort=lastModified%20desc',
				withCredentials: true
			}).then(response => {
				let contentItems = [];
				if(response.data.numFound > 0) {
					response.data.documents.forEach(itemDoc => {
						// the entire content item is available in the "document" field as a JSON string, so we'll parse it
						let item = $.parseJSON(itemDoc.document).elements;
						// normalize the values
						item.id = itemDoc.id;
						item.title = item.title ? item.title.value : 'untitled';
						item.summary = item.summary ? item.summary.value : '';
						item.author = item.author ? item.author.value : '';
						item.body = item.body ? item.body.value : '';
						item.imgSrc = item.image.asset ? baseTenantAPIURL + item.image.asset.resourceUri : '';
						item.thumbnail = item.image.renditions && item.image.renditions.thumbnail ? baseTenantAPIURL + item.image.renditions.thumbnail.source : '';
						let publishDate = item.publishDate ? new Date(item.publishDate.value) : new Date('');
						item.publishDate = publishDate.toLocaleDateString();
						// add the content item to the array
						contentItems.push(item);
					});
				}
				return contentItems;
			});
	}

	return {
		getBaseURL,
		getArticleCategories,
		getContentItemsByCategoryName
	};
}]);


// An angular component for a bootstrap tabbed navigation based on the Article taxonomy data
module.component('taxonomyNavigation', {
	controller: ['$rootScope', '$state', 'wchService', function ($rootScope, $state, wchService) {

		// initialize data
		this.tabs = [];
		this.status = 'loading';	// set the status, one of 'loading', 'failed', 'done'

		// load the navigation - TODO get taxonomy/categories from search
		wchService.getArticleCategories().then(categories => {
			this.tabs = categories;
			this.status = 'done';
			if(this.tabs.length) {
				$state.transitionTo('cards', { category: this.tabs[0].name });
			}

		// print out any errors
		}).catch(error => {
			this.status = 'failed';
			console.error('Error loading the navigation: %o', error);
			// an empty category indicates a failure to the 'articleCards' component
			$state.transitionTo('cards', { category: '' });
		});


		// update the navigation selection on state change
		$rootScope.$on('$stateChangeSuccess', (event, toState, toParams) => {
			const curCategory = toParams.category;
			this.tabs.forEach(item => {
				item.active = item.name === curCategory ? true : false;
			});
		});
	}],

	template: `
		<span ng-if="$ctrl.status === 'loading'" class="pulse nav-item"><div></div><div></div><div></div><div></div><div></div><div></div></span>
		<span ng-if="$ctrl.status === 'failed'" class="nav-item"><div class="alert" role="alert">Could not load navigation</div></span>
		<ul ng-if="$ctrl.status === 'done'" class="nav nav-pills">
			<li ng-repeat="tab in $ctrl.tabs track by tab.id" class="nav-item">
				<a class="nav-link" ui-sref="cards({ category: tab.name })" ng-class="{ active: tab.active }" class="nav-link" href="#">{{tab.name}}</a>
			</li>
		</ul>
	`
});


// An angular component for bootstrap cards based on the Article content items
module.component('articleCards', {
	controller: ['$stateParams', 'wchService', function ($stateParams, wchService) {

		// initialize cards Array
		this.cards = [];
		// set the status, one of 'loading', 'failed', 'done'
		this.status = 'loading';
		// grab the current category name from the angular state parameters
		this.categoryName = $stateParams.category;

		// if a category name was passed in, load the content items tagged with it
		if(this.categoryName === '') {
			this.status = 'failed';
		}
		else if(this.categoryName) {
			this.status = 'loading';
			// load the Articles
			wchService.getContentItemsByCategoryName(this.categoryName).then(items => {
				this.cards = items;
				this.status = items.length ? 'done' : 'none';

			// print out any errors
			}).catch(error => {
				this.status = 'failed';
				console.error('Error loading the content items in the %o category: %o', this.categoryName, error);
			});
		} else {
			this.status = 'loading';
		}
	}],

	template: `
		<div ng-if="$ctrl.status === 'loading'" class="spinner"></div>
		<div ng-if="$ctrl.status === 'failed'" class="alert" role="alert">Could not load {{$ctrl.categoryName}} articles</div>
		<div ng-if="$ctrl.status === 'none'" class="alert" role="alert">No results for {{$ctrl.categoryName}}</div>
		<div ng-if="$ctrl.status === 'done'" class="cards">
			<a class="flex-card" ng-repeat="card in $ctrl.cards track by card.id" ui-sref="cards.details({ item: card, itemName: card.title })" href="#">
				<span class="flex-card-header">
					<img alt="{{card.title}}" src="{{card.thumbnail}}" />
					<span class="card-title">
						<h3>{{card.title}}</h3>
					</span>
				</span>
				<span class="card-line"></span>
				<span class="card-summary">
					{{card.summary}}
				</span>
				<span class="card-meta">
					by <span class="capital">{{card.author}}</span> on {{card.publishDate}}
				</span>
			</a>
		</div>
		<div ui-view></div>
	`
});


// An angular component to show the entire Article in a modal dialog
module.component('articleDetails', {
	controller: ['$state', '$stateParams', function ($state, $stateParams) {

		// grab the current Article from the angular state parameters
		this.item = $stateParams.item;

		// open the dialog
		$('#detailsModal').modal('show');

		// go back to the cards when the dialog closes
		$('#detailsModal').on('hidden.bs.modal', function (e) {
			$state.go('^');
		});
	}],

	template: `
		<div class="modal fade" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalLabel" aria-hidden="true">
			<div class="modal-dialog" role="document">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
						<h4 class="modal-title" id="detailsModalLabel">{{$ctrl.item.title}}</h4>
					</div>
					<div class="modal-body">
						<img src="{{$ctrl.item.imgSrc}}" class="img-fluid" alt="{{$ctrl.item.title}}">
						<blockquote class="blockquote blockquote-reverse">
							<p class="mb-0">{{$ctrl.item.summary}}</p>
							<footer class="blockquote-footer">{{$ctrl.item.publishDate}} by <cite title="Source Title">{{$ctrl.item.author}}</cite></footer>
						</blockquote>
						<p>{{$ctrl.item.body}}</p>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-primary" data-dismiss="modal">close</button>
					</div>
				</div>
			</div>
		</div>
	`
});
