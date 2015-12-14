var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var s = require("underscore.string");
var app     = express();

app.get('/scrape', function(req, res){
    var personId = req.query.id;
    url = 'https://us.linkedin.com/in/'+personId;
    var options = {
	  url: url,
	  headers: {
	  	"Host": 'us.linkedin.com',
		"User-Agent": 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:42.0) Gecko/20100101 Firefox/42.0',
		"Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
		"Accept-Language": 'en-US,en;q=0.5',
		"Accept-Encoding": 'gzip, deflate',
		"Content-Type": 'application/json; charset=UTF-8',
		"Referer": 'https://us.linkedin.com/in/mohammed-lazhari-70069539',
		"Content-Length": 636,
		"Connection": 'keep-alive',
		"Pragma": 'no-cache',
		"Cache-Control": 'no-cache',
	    "Cookie": 'bcookie="v=2&3c90d372-5cb4-4490-8667-fa8d3df5d3e3"; __utma=226841088.1249257432.1445772302.1448833050.1449133419.5; __utmz=226841088.1448833050.4.2.utmcsr=google|utmccn=(organic)|utmcmd=organic|utmctr=(not%20provided); __utmv=226841088.guest; visit="v=1&G"; bscookie="v=1&201511101058389e3bf5e5-5051-438c-892f-1b5cbc3df1dbAQGaxJ5HiC14JxTrRA67R0-il_YeDjD4"; _ga=GA1.2.1249257432.1445772302; lang="v=2&lang=en-us"; lidc="b=TB98:g=153:u=1:i=1450090418:t=1450176818:s=AQFSU6zA88wb33lm4u8sT9S-ywMU3EJV"; leo_auth_token="GST:9Iooe2VyK5YpL9TX3vxkjEGCoFY19K8SX6NkGYyYKSv5AzTXLZngPh:1450096754:fa06601e3f9e7c7dc46f444cc7d5e2545ee0efa7"; JSESSIONID="ajax:6642126039141240966"; L1e=70eb6; L1c=506114f5; RT=s=1450096754692&r=https%3A%2F%2Fus.linkedin.com%2Fin%2Fmohammed-lazhari-70069539'
	  }
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
    request(url, function(error, response, html){
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
