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

App.DetailsView = Ember.View.extend({
  templateName: 'contributor-details'
})

App.ReposView = Ember.View.extend({
  templateName: 'repos'
})

App.Contributor = Ember.Object.extend({
  loadMoreDetails: function(){
    $.ajax({
      url: 'https://api.github.com/users/%@'.fmt(this.get('login')),
      context: this,
      dataType: 'jsonp',
      success: function(response){
        this.setProperties(response.data);
      }
    })
  },

  loadRepos: function(){
    console.log("foo");
    $.ajax({
      url: 'https://api.github.com/users/%@/repos'.fmt(this.get('login')),
      context: this,
      dataType: 'jsonp',
      success: function(response){
        console.log("fooo", response)
        this.set('repos', response.data);
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

      showDetails: Ember.Route.transitionTo("details"),
      showRepos: Ember.Route.transitionTo("repos"),
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
      details: Ember.Route.extend({
        route: "/",
        connectOutlets: function(router){
          router.get("oneContributorController.content").loadMoreDetails();
          router.get("oneContributorController").connectOutlet("details");
        }
      }),
      repos: Ember.Route.extend({
        route: "/repos",
        connectOutlet: function(router){
          router.get("oneContributorController.content").loadRepos();
          router.get("oneContributorController").connectOutlet("repos");
        }
      })
    })
  })
});


App.initialize();
