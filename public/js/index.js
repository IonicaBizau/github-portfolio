$.getJSON("/getConfig", function (config) {
    $.getJSON("https://api.github.com/users/" + config.username + "/repos?access_token=" + config.token + "&per_page=100", function (myRepos) {

        var repos = myRepos;
        var $repos = [];

        for (var i = 0; i < repos.length; ++i) {

            if (repos[i].fork) continue;

            var $clone = $(".template").clone().removeClass("template");
            $clone.find(".repo-title").text(repos[i].name);

            (function (clone, name) {
                $.getJSON("https://api.github.com/repos/" + config.username + "/" + name + "/readme?access_token=c7a3f3cdaff220271767587beb487e09cf0e0df3", function (repo) {
                    var markdown = Base64.decode(repo.content);
                    $.ajax({
                        // type post
                        type: "GET",
                        // to url
                        url: "/getHTML?markdown=" + encodeURIComponent(markdown),
                        // set the success handler
                        success: function (data) {
                            clone.find(".description").html(data);
                            $("table").addClass("table table-bordered");
                            $("img").css("max-width", "100%");
                        },
                        // set the error handler
                        error: function (data) {
                            // get the json response
                            data = data.responseJSON;
                            console.error(data.error || data);
                        }
                    });
                });
            })($clone, repos[i].name);

            $repos.push($clone);
        }

        $(".repos").append($repos);
    });
});
