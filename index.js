var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var s = require("underscore.string");
var app     = express();
var httpProxy = require('http-proxy');
var Agent = require('socks5-http-client/lib/Agent');
app.get('/scrape', function(req, res){
    var personId = req.query.id;
    url = 'https://us.linkedin.com/in/'+personId;
    var options = {
	  	url: url
	};
    var profile = {
        name:"",
        demographics:"",
        title:"",
        picture: "test",
        summary: "",
        connections: "",
        skills: [],
        interests: [],
        experiences: [],
        educations: [],
        projects: [],
        languages: []
    };
    request(options, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            var name, role, demographics, summary, picture, connections;

            $('#name').filter(function(){
                var data = $(this);
                name = data.text();
                profile.name = name;
            });
            $('p.title').filter(function(){
                var data = $(this);
                title = data.text();
                profile.title = title;
            });
            $('.member-connections > strong:nth-child(1)').filter(function(){
                var data = $(this);
                connections = data.text();
                profile.connections = connections;
            });
            $('#demographics .descriptor').filter(function(){
                var data = $(this);
                demographics = data.text();
                profile.demographics = demographics;
            });
            $('.profile-picture .photo').filter(function(){
                var data = $(this);
                picture = data.attr('data-delayed-url');
                profile.picture = picture;
            });
            $('#summary .description').filter(function(){
                var data = $(this);
                summary = s.clean(data.text());
                profile.summary = summary;
            });
            $('#skills > ul:nth-child(2) li').each(function() {
                var skills = $(this);
                if(!skills.hasClass('see-more')){
                    skills.filter(function() {
                        var data = $(this);
                        var skill = data.text();
                        profile.skills.push(skill);
                    });
                }
            });
            $('#interests > ul:nth-child(2) li').each(function() {
                var interests = $(this);
                interests.filter(function() {
                    var data = $(this);
                    var interest = data.text();
                    profile.interests.push(interest);
                });
            });
            $('ul.positions li').each(function() {
                var positions = $(this);
                positions.filter(function() {
                    var position = {};
                    var data = $(this);
                    position.title = data.find('.item-title').text();
                    position.company = data.find('h5.item-subtitle').text();
                    position.date_range = {};
                    position.date_range.start = data.find('span.date-range > time:nth-child(1)').text();
                    position.date_range.end = data.find('span.date-range > time:nth-child(2)').text();
                    profile.experiences.push(position);
                });
            });
            $('ul.schools li').each(function() {
                var educations = $(this);
                educations.filter(function() {
                    var education = {};
                    var data = $(this);
                    education.school = data.find('h4.item-title').text();
                    education.diplome = data.find('h5.item-subtitle').text();
                    education.date_range = {};
                    education.date_range.start = data.find('span.date-range > time:nth-child(1)').text();
                    education.date_range.end = data.find('span.date-range > time:nth-child(2)').text();
                    profile.educations.push(education);
                });
            });
            $('#projects > ul li.project').each(function() {
                var projects = $(this);
                projects.filter(function() {
                    var project = {};
                    var data = $(this);
                    project.title = data.find('h4.item-title').text();
                    project.date_range = {};
                    project.date_range.start = data.find('span.date-range > time:nth-child(1)').text();
                    project.date_range.end = data.find('span.date-range > time:nth-child(2)').text();
                    profile.projects.push(project);
                });
            });
            $('#languages > ul:nth-child(2) li').each(function() {
                var languages = $(this);
                languages.filter(function() {
                    var language = {};
                    var data = $(this);
                    language.name = data.find('h4.name').text();
                    language.proficiency = data.find('p.proficiency').text();
                    profile.languages.push(language);
                });
            });
        }

        // To write to the system we will use the built in 'fs' library.
        // In this example we will pass 3 parameters to the writeFile function
        // Parameter 1 :  output.json - this is what the created filename will be called
        // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
        // Parameter 3 :  callback function - a callback function to let us know the status of our function

        fs.writeFile('./profiles/'+req.query.id+'.json', JSON.stringify(profile, null, 4), function(err){

            console.log('File successfully written! - Check your project directory for the output.json file');

        });

        // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
        res.send(profile);

    }) ;
});
app.listen(4040);

httpProxy.createServer({
  target: {
    host: 'localhost',
    port: 4040
  },
  ssl: {
    key: fs.readFileSync('server-key.pem', 'utf8'),
    cert: fs.readFileSync('server-cert.pem', 'utf8')
  }
}).listen(9050);