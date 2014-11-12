//Load require libraries
var express = require('express'),
  	consolidate = require('consolidate'),
  	routes = require('./routes'),
  	http = require('http'),
  	path =  require('path'),
  	config = require('./config.js'),
  	_ = require('underscore');

var mongoskin = require('mongoskin'),
  	dbUrl = process.env.MONGOHQ_URL || config.database.URL,
  	db = mongoskin.db(dbUrl, {safe:true}),
  	collections = {
    	builds: db.collection('builds'),
    	buildcriterias : db.collection('buildcriterias'),
    	commits: db.collection('commits'),
    	reports: db.collection('reports'),
    	testcriterias: db.collection('testcriterias'),
    	tests: db.collection('tests')
  	};

var logger = require('morgan'),
	errorHandler = require('errorhandler'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override');

//Configure settings
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', consolidate.handlebars);
app.set('view engine', 'html');

//Define middleware
app.use(function(req, res, next){
	if(!collections.builds || !collections.reports || !collections.tests) return next(new Error('No collections.'))
	req.collections = collections;
	return next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

if('development' == app.get('env')){
	app.use(errorHandler());
}

//Define Routes and views
app.get('/', routes.build.show_all);
app.get('/:build_id', routes.build.show);
app.get('/:build_id/report/:report_id', routes.report.show)
app.get('/:build_id/report/:report_id/test/:test_id', routes.test.show);

//REST API ROUTES
app.get('/api/builds', routes.build.list);
app.get('/api/criterias/build', routes.build.search);

app.get('/api/builds/:build_id', routes.build.view);
app.get('/api/commits', routes.commit.list);
app.get('/api/reports', routes.report.list);

app.get('/api/reports/:report_id', routes.report.view);
app.get('/api/criterias/test/:report_id', routes.test.search);
app.get('/api/tests', routes.test.list);
app.get('/api/tests/stat', routes.test.stat);

app.get('/api/tests/:test_id', routes.test.view);



app.all('*', function(req, res){
  res.status(404).end();
});

//Start the server
var server = http.createServer(app);
var boot = function(){
  server.listen(app.get('port'), function(){
    console.info('Express server listening on port ' + app.get('port'));
  });
}

var shutdown = function(){
  server.close();
}

if(require.main === module){
  boot();
}else{
  console.info('Running app as a module')
  exports.boot = boot;
  exports.shutdown = shutdown;
  exports.port = app.get('port');
}
