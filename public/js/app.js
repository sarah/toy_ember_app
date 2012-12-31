App = Ember.Application.create();
App.GID = "fe9cb46d7aba268d722d"
App.SECRET = "4529a54f21a46fd9365334b6533bfdeb04ed8707"

App.AuthenticatedURLParams = '?client_id=' + App.GID + "&client_secret=" + App.SECRET;

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

App.DetailsView = Ember.View.extend({
  templateName: 'contributor-details'
})

App.OneContributorController = Ember.ObjectController.extend();


App.Contributor = Ember.Object.extend({
  loadMoreDetails: function(){
    $.ajax({
      url: "https://api.github.com/users/%@".fmt(this.get('login')) + App.AuthenticatedURLParams,
      context: this,
      dataType: 'jsonp',
      success: function(response){
        this.setProperties(response.data);
      }
    })
  }
});


App.Contributor.reopenClass({
  findOne: function(username){
    var contributor = App.Contributor.create({
      login: username
    });

    $.ajax({
      url: 'https://api.github.com/repos/emberjs/ember.js/contributors' + App.AuthenticatedURLParams,
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
      url: "https://api.github.com/repos/emberjs/ember.js/contributors" + App.AuthenticatedURLParams,
      dataType: 'jsonp',
      success: function(response){
        console.log(response);
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
      showAllContributors: Ember.Route.transitionTo("contributors"),
      connectOutlets: function(router, context){
        router.get("applicationController").connectOutlet('oneContributor', context);
      },
      serialize: function(router, context){
        return{ githubUserName: context.get('login') }
      },
      deserialize: function(router, urlParams){
        return App.Contributor.findOne(urlParams.githubUserName);
      },

      initialState: 'details',
      repos: Ember.Route.extend({
        route: '/repos/',
        connectOutlets: function(router){
          router.get("oneContributorController").connectOutlet("repos");
        }
      }),

      details: Ember.Route.extend({
        route: '/',
        connectOutlets: function(router){
          router.get('oneContributorController.content').loadMoreDetails();
          router.get('oneContributorController').connectOutlet('details');
        }
      })
    })
  })
});


App.initialize();
