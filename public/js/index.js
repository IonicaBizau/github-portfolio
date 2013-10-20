$.getJSON("/getConfig", function (config) {
    $.getJSON("https://api.github.com/users/" + config.username + "/repos?access_token=" + config.token + "&per_page=100", function (myRepos) {

        var repos = myRepos;
        var $repos = [];

        for (var i = 0; i < repos.length; ++i) {

            if (repos[i].fork || repos[i].name.indexOf("bind") !== -1) continue;

            var $clone = $(".template").clone().removeClass("template");
            $clone.find(".repo-title").text(repos[i].name);
            $.getJSON("https://api.github.com/repos/" + config.username + "/" + repos[i].name + "/readme?access_token=c7a3f3cdaff220271767587beb487e09cf0e0df3", function (repo) {
                $clone.find(".description").text(Base64.decode(repo.content));
            });

            $repos.push($clone);
        }

        $(".repos").append($repos);
    });
});
