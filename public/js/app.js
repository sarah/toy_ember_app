App = Ember.Application.create();

App.ApplicationView = Ember.View.extend({
  templateName: "application"
});

App.ApplicationController = Ember.Controller.extend();

App.AllContributorsController = Ember.ArrayController.extend();
App.AllContributorsView = Ember.View.extend({
  templateName: 'contributors'
});

App.OneContributorView = Ember.View.extend({
  templateName: 'a-contributor'
});

App.OneContributorController = Ember.ObjectController.extend();


App.Contributor = Ember.Object.extend();
App.Contributor.reopenClass({
  findOne: function(username){
    var contributor = App.Contributor.create({
      login: username
    });

    $.ajax({
      url: 'https://api.github.com/repos/emberjs/ember.js/contributors',
      dataType: 'jsonp',
      context: contributor,
      success: function(response){
        this.setProperties(response.data.findProperty("login", username));
      }
    })
    return contributor;
  }
});
App.Contributor.reopenClass({
  allContributors: [],
  find: function(){
    var self = this;
    $.ajax({
      url: "https://api.github.com/repos/emberjs/ember.js/contributors",
      dataType: 'jsonp',
      success: function(response){
        response.data.forEach(function(contributor){
          self.allContributors.addObject(App.Contributor.create(contributor))
        })
      }
    });
    return this.allContributors;
  }
});

App.Router = Ember.Router.extend({
  enableLogging: true,
  root: Ember.Route.extend({
    contributors: Ember.Route.extend({
      route: '/',

      showContributer: Ember.Route.transitionTo('aContributor'),

      connectOutlets: function(router){
        router.get('applicationController').connectOutlet('allContributors', App.Contributor.find());
      }
  }),

    aContributor: Ember.Route.extend({
      route: '/:githubUserName',
      connectOutlets: function(router, context){
        router.get("applicationController").connectOutlet('oneContributor', context);
      },
      serialize: function(router, context){
        return{
          githubUserName: context.get('login')
        }
      },
      deserialize: function(router, urlParams){
        return App.Contributor.findOne(urlParams.githubUserName);
      }
    })
  })
});


App.initialize();
