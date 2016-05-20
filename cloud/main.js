// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.afterSave("Posts", function(request) {
  query = new Parse.Query("Users");
  query.get(request.object.get("user").id, {
    success: function(user) {
      if (request.object.get("status") == 'A') {
        user.set("isAvailable",true);
        user.set("activePost", request.object);
      }
      else if (request.object.get("status") == 'I') {
        user.set("isAvailable",false);
        user.set("activePost", null);
      }
      console.log(user);
      user.save();
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});

Parse.Cloud.job("postInvalidate", function(request, status) {
  var query = new Parse.Query("Posts");
  query.equalTo("status", "A");
  query.find({
    success: function(results) {
      for (var i = 0; i < results.length; i++) {
        var post = results[i];
        if (post.get("expiresAt") < Date.now()) {
          post.set("status", "I");
          post.save();
        }
      }
    },
    error: function() {
      response.error("movie lookup failed");
    }
  }).then(function() {
    // Set the job's success status
    status.success("Sweep Complete Successfully");
  }, function(error) {
    // Set the job's error status
    status.error("Uh oh, something went wrong.");
  });
});
