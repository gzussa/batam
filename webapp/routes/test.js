var _ = require('underscore');
var util = require('util');
var mongoskin = require('mongoskin');
var validator = require('validator');
var formatter = config = require('../util/formatter.js');
var PDFKit = require('pdfkit');

/**
 * PAGE path /:build_id/report/:report_id/test/:test_id
 */
exports.show = showTest;

function showTest(req, res, next){
	var findBuild = function (error, build){
		var findReport = function (error, report){
			var findTest = function (error, test){
				
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isEmpty(report) || _.isNull(test)){
					return next('Test '+req.params.test_id+' for report '+req.params.report_id+' in build '+req.params.build_id+' not found.');
				}
				
				//Render page
				res.render('build/report/test/view', {build_id: build.id, build_name: build.name, report_id: report.id, report_name: report.name, test_id: test._id});
			};
		    
			//Handle Error.
			if(error){ 
				return next(error);
			}
			if(_.isEmpty(report) || _.isNull(report)){
				return next('Report '+req.params.report_id+' for build '+req.params.build_id+' not found.');
			}
			
			//Fetch test.
			req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id), report_id: req.params.report_id}, findTest);
		
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		if(_.isEmpty(build) || _.isNull(build)){
			return next('Build '+req.params.build_id+' not found.');
		}
		
		//Fetch build report.
		req.collections.reports.findOne({id: req.params.report_id, build_id: build.id}, findReport);
	};
	
	//Validate inputs.
	if(!req.params.build_id || !req.params.report_id || !req.params.test_id){
		return next(new Error('No build_id, report_id or test_id params in url.'));
	}
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.params.report_id) || !validator.isLength(req.params.report_id, 5, 60) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.report_id) || !validator.matches(req.params.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
		
	//Fetch query result.
	req.collections.builds.findOne({id: req.params.build_id}, findBuild);
}

/**
 * API path /api/tests
 */
exports.list = findTestList; 

function findTestList(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			var countTest = function (error, count){
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isNull(count)){
					count = 0;
				}				
				
				result.recordsTotal = count;
				result.recordsFiltered = count;
				result.data = data;
				//Send result.
				res.send(result);
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = ['<a href="/'+req.query.build_id+'/report/'+req.query.report_id+'/test/'+tests[index]._id+'">'+tests[index].name+'</a>', formatter.formatStatus(tests[index].status), formatter.formatRegression(tests[index].status, tests[index].regression), formatter.formatTime(tests[index].time)]; 
				for(var i = 0; i < criterias.length; i++){
					var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
					if(!_.isUndefined(tests[index][currentCriterias])){
						data[index][4+i] = tests[index][currentCriterias];
					}else{
						data[index][4+i] = " ";
					}
				}
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count(searchCriterias, countTest);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		console.log("search criterias : "+ util.inspect(searchCriterias));
		//Fetch tests based on defined searchCriterias
		req.collections.tests.find(searchCriterias)
			.limit(parseInt(req.query.length))
			.skip(parseInt(req.query.start))
				.toArray(findTests);
	};
	
	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start || !req.query.build_id || !req.query.report_id){
		return next(new Error('No draw, length, start, build_id or report_id query params.'));
	}
	//if(validator.isNull(req.query.build_id) || !validator.isLength(req.query.build_id, 5, 30) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	//if(validator.isNull(req.query.report_id) || !validator.isLength(req.query.report_id, 5, 60) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.query.report_id) || !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.draw) || !validator.isInt(req.query.draw)){
		return next(new Error('draw param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.length) || !validator.isInt(req.query.length)){
		return next(new Error('length param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.start) || !validator.isInt(req.query.start)){
		return next(new Error('start param should not be null and should be a numbe.r'));
	}
	
	//Create response object.
	var result = {};
	//Set draw value.
	result.draw = req.query.draw;
	//Create data obejct array.
	var data = [];
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * PAGE path /:build_id/report/:report_id/download
 */
exports.download = downloadPDF; 

function downloadPDF(req, res, next){
	var findBuild = function(error, build){
		var findReports = function(error, reports){
			var findTests = function(error, tests){
				//Handle Error.
				if(error){
					return next(error);
				}
				
				//Create a pdf document
				var doc = new PDFKit({bufferPages: true});
				var stream = doc.pipe(res);
				
				//First page (Build infos)
				doc.fillColor('black').fontSize(30).text('Build Report');
				doc.moveDown();
				doc.fontSize(15).text('Build Name', {underline:true, continued: true}).text(': '+build.name, {underline:false});
				doc.moveDown();
				doc.fontSize(15).text('Date', {underline:true, continued: true}).text(': '+build.date, {underline:false});
				doc.moveDown();
				if(!_.isNull(build.duration.value)){
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': '+durationToStr(build.duration.value), {underline:false});
				}else{
					doc.fontSize(15).text('Duration', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}	
				doc.moveDown();
				doc.fontSize(15).text('Total Tests', {underline:true, continued: true}).text(': '+build.tests.value, {underline:false});
				doc.moveDown();
				doc.fontSize(15).text('Passes', {underline:true, continued: true}).text(': '+build.passes.value, {underline:false});
				doc.moveDown();
				if(!_.isUndefined(build.regressions) && !_.isUndefined(build.regressions.value)){
					doc.fontSize(15).text('Regressions', {underline:true, continued: true}).text(': '+build.regressions.value, {underline:false});
				}else{
					doc.fontSize(15).text('Regressions', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}	
				doc.moveDown();
				if(!_.isUndefined(build.failures) && !_.isUndefined(build.failures.value)){
					doc.fontSize(15).text('Failures', {underline:true, continued: true}).text(': '+build.failures.value, {underline:false});
				}else{
					doc.fontSize(15).text('Failures', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}
				doc.moveDown();
				if(!_.isUndefined(build.errors) && !_.isUndefined(build.errors.value)){
					doc.fontSize(15).text('Errors', {underline:true, continued: true}).text(': '+build.errors.value, {underline:false});
				}else{
					doc.fontSize(15).text('Errors', {underline:true, continued: true}).text(': Not Available', {underline:false});
				}
				//Table of Content
				doc.addPage();
				doc.fillColor('black').fontSize(20).text('Table of Content');
				doc.moveDown();
				
				//Summary
				doc.addPage();
				var summaryPage = doc.bufferedPageRange().count -1;
				var initialYAxis = 150;
				doc.fontSize(30).fillColor('black').text('Summary');
				doc.rect(75, initialYAxis, 200, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(275, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(325, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(375, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(425, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(475, initialYAxis, 50, 25).fillAndStroke("#F0F0F0", "black");
				doc.fontSize(8).fillColor('black').text('Functional Areas', 80, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Tests', 280, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Passes', 330, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Regressions', 380, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Failures', 430, initialYAxis + 5);
				doc.fontSize(8).fillColor('black').text('Errors', 480, initialYAxis + 5);
				var totalTests = 0;
				var totalPasses = 0;
				var totalRegressions = 0;
				var totalFailures = 0;
				var totalErrors = 0;

				var rowPerPage = 20;
				var pageIndex = 1;
				for(var i = 1; i <= reports.length; i++){
					if(pageIndex % rowPerPage == 0){
						doc.addPage();
						pageIndex = 1;
						rowPerPage = 25;
						initialYAxis = 50; 
					}
					doc.rect(75, initialYAxis+(pageIndex*25), 200, 25).fillAndStroke("white", "black");
					doc.rect(275, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
					doc.rect(325, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
					if(reports[i-1].tests.regressions.value != 0){
						doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i-1].tests.failures.value != 0){
						doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i-1].tests.errors.value != 0){
						doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
					}
					
					doc.fontSize(9).fillColor('black').text(reports[i-1].name, 80, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.all.value, 280, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.passes.value, 330, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.regressions.value, 380, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.failures.value, 430, initialYAxis+(pageIndex*25)+5);
					doc.fontSize(9).fillColor('black').text(reports[i-1].tests.errors.value, 480, initialYAxis+(pageIndex*25)+5);
					
					totalTests += reports[i-1].tests.all.value;
					totalPasses += reports[i-1].tests.passes.value;
					totalRegressions += reports[i-1].tests.regressions.value;
					totalFailures += reports[i-1].tests.failures.value;
					totalErrors += reports[i-1].tests.errors.value;
					
					pageIndex++;
				}
				doc.rect(75, initialYAxis+(pageIndex*25), 200, 25).fillAndStroke("#F0F0F0", "black");
				doc.rect(275, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
				doc.rect(325, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("white", "black");
				if(totalRegressions != 0){
					doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(375, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				if(totalFailures != 0){
					doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(425, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				if(totalErrors != 0){
					doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#990000", "black");
				}else{
					doc.rect(475, initialYAxis+(pageIndex*25), 50, 25).fillAndStroke("#669966", "black");
				}
				doc.fontSize(9).fillColor('black').text("Total", 80, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalTests, 280, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalPasses, 330, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalRegressions, 380, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalFailures, 430, initialYAxis+(pageIndex*25)+5);
				doc.fontSize(9).fillColor('black').text(totalErrors, 480, initialYAxis+(pageIndex*25)+5);
				
				//Tests results per reports
				doc.addPage();
				var reportPage = doc.bufferedPageRange().count -1;
				doc.fontSize(30).fillColor('black').text('Results by Functional Area');
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(20).fillColor('black').text(reports[i].name, {underline:false});
					doc.moveDown();
					doc.fontSize(10).fillColor('black').text('Tests', {underline:true, continued: true}).text(': '+reports[i].tests.all.value+", ", {underline:false, continued: true})
					.text('Pass', {underline:true, continued: true}).text(': '+(reports[i].tests.all.value - reports[i].tests.regressions.value)+", ", {underline:false, continued: true})
					.text('Failures', {underline:true, continued: true}).text(': '+reports[i].tests.regressions.value+", ", {underline:false, continued: true})
					.text('Run Time', {underline:true, continued: true}).text(': '+durationToStr(reports[i].duration.value), {underline:false});
					doc.moveDown();
					doc.fontSize(10).text(reports[i].description, {underline:false});
					
					doc.rect(60, 200, 380, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(435, 200, 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(495, 200, 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.fontSize(8).fillColor('black').text('Test Name / Description', 65, 205);
					doc.fontSize(8).fillColor('black').text('Status', 440, 205);
					doc.fontSize(8).fillColor('black').text('Run Time', 500, 205);
					var rowPerPage = 19;
					initialYAxis = 200;
					var pageIndex = 1;
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id){
							if(pageIndex % rowPerPage == 0){
								doc.addPage();
								pageIndex = 1;
								rowPerPage = 25;
								initialYAxis = 50;
							}
						
							if(tests[j].status != 'pass'){
								doc.rect(60, initialYAxis+(pageIndex * 25), 5, 50).fillAndStroke("#990000", "black");
							}else{
								doc.rect(60, initialYAxis+(pageIndex * 25), 5, 50).fillAndStroke("#669966", "black");
							}
								
							doc.rect(65, initialYAxis+(pageIndex * 25), 370, 25).fillAndStroke("white", "black");
							if(tests[j].status != 'pass'){
								doc.rect(435, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(435, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#669966", "black");
							}
							doc.rect(495, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("white", "black");
							
							doc.fontSize(6).fillColor('black').text(tests[j].name, 70, initialYAxis + (pageIndex * 25) + 5);
							doc.fontSize(6).fillColor('black').text(tests[j].status, 440, initialYAxis + (pageIndex * 25) + 5);
							doc.fontSize(6).fillColor('black').text(durationToStr(tests[j].duration.value), 500, initialYAxis + (pageIndex * 25) + 5);
							
							pageIndex++;
							doc.rect(65, initialYAxis+(pageIndex * 25), 490, 25).fillAndStroke("#F0F0F0", "black");
							doc.fontSize(6).fillColor('black').text(tests[j].description == null ? "Description Not Available" : tests[j].description, 70, initialYAxis + (pageIndex * 25) + 5);
							
							pageIndex++;
						}
					}
					//Sub Total
					doc.rect(60, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(120, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(180, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(240, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.rect(300, initialYAxis+(pageIndex * 25), 60, 25).fillAndStroke("#F0F0F0", "black");
					doc.fontSize(9).fillColor('black').text('Total', 65, initialYAxis+(pageIndex  * 25) + 5);
					doc.fontSize(9).fillColor('black').text('Pass', 125, initialYAxis+(pageIndex  * 25) + 5);
					doc.fontSize(9).fillColor('black').text('Regressions', 185, initialYAxis+(pageIndex  * 25) + 5);
					doc.fontSize(9).fillColor('black').text('Failues', 245, initialYAxis+(pageIndex  * 25) + 5);
					doc.fontSize(9).fillColor('black').text('Errors', 305, initialYAxis+(pageIndex  * 25) + 5);
					doc.rect(60, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("white", "black");
					doc.rect(120, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("white", "black");
					if(reports[i].tests.regressions.value != 0){
						doc.rect(180, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(180, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i].tests.failures.value != 0){
						doc.rect(240, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(240, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#669966", "black");
					}
					if(reports[i].tests.errors.value != 0){
						doc.rect(300, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#990000", "black");
					}else{
						doc.rect(300, initialYAxis+((pageIndex + 1) * 25), 60, 25).fillAndStroke("#669966", "black");
					}
					doc.fontSize(10).fillColor('black').text(reports[i].tests.all.value, 65, initialYAxis+((pageIndex + 1)  * 25) + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.passes.value, 125, initialYAxis+((pageIndex + 1)  * 25) + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.regressions.value, 185, initialYAxis+((pageIndex + 1)  * 25) + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.failures.value, 245, initialYAxis+((pageIndex + 1)  * 25) + 5);
					doc.fontSize(10).fillColor('black').text(reports[i].tests.errors.value, 305, initialYAxis+((pageIndex + 1)  * 25) + 5);
				}
				
				//Failing test log messages
				doc.addPage();
				var logPage = doc.bufferedPageRange().count -1;
				initialYAxis = 150;
				doc.fontSize(30).fillColor('black').text('Message Logs');
				for(var i = 0; i < reports.length; i++){
					doc.addPage();	
					doc.fontSize(20).fillColor('black').text(reports[i].name);
					doc.moveDown();
					doc.fontSize(12).fillColor('black').text('Tests', {underline:true, continued: true}).text(': '+reports[i].tests.all.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Pass', {underline:true, continued: true}).text(': '+(reports[i].tests.passes.value), {underline:false});
					doc.fontSize(12).fillColor('black').text('Regressions', {underline:true, continued: true}).text(': '+(reports[i].tests.regressions.value), {underline:false});
					doc.fontSize(12).fillColor('black').text('Failures', {underline:true, continued: true}).text(': '+reports[i].tests.failures.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Errors', {underline:true, continued: true}).text(': '+reports[i].tests.errors.value, {underline:false});
					doc.fontSize(12).fillColor('black').text('Run Time', {underline:true, continued: true}).text(': '+durationToStr(reports[i].duration.value), {underline:false});
					doc.moveDown();
					doc.fontSize(9).text(reports[i].description == null ? "No description available" : reports[i].description, {underline:false});
						
					for(var j = 0; j < tests.length; j++){
						//fetch test that belongs to the current report
						if(tests[j].report_id == reports[i].id && tests[j].status != 'pass'){
							doc.addPage();
							doc.fontSize(10).fillColor('black').text('Test Name', {underline:true, continued: true}).text(": "+tests[j].name, {underline:false});
							doc.moveDown();
							doc.fontSize(9).text(tests[j].description == null ? "No description available" : tests[j].description, {underline:false, continued: false});
							
							doc.rect(100, initialYAxis+(0 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							if(tests[j].status != 'pass'){
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#990000", "black");
							}else{
								doc.rect(200, initialYAxis+(0 * 25), 300, 25).fillAndStroke("#669966", "black");
							}			
							doc.fontSize(9).fillColor('black').text("Status", 105, 150 + (0 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(tests[j].status, 205, 150 + (0 * 25) + 5);
							
							doc.rect(100, initialYAxis+(1 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(1 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(9).fillColor('black').text("Start Time", 105, 150 + (1 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(tests[j].start_date+" ms", 205, 150 + (1 * 25) + 5);
							
							doc.rect(100, initialYAxis+(2 * 25), 100, 25).fillAndStroke("#F0F0F0", "black");
							doc.rect(200, initialYAxis+(2 * 25), 300, 25).fillAndStroke("white", "black");			
							doc.fontSize(9).fillColor('black').text("Duration", 105, 150 + (2 * 25) + 5);
							doc.fontSize(9).fillColor('black').text(durationToStr(tests[j].duration.value), 205, 150 + (2 * 25) + 5);
							
							doc.moveDown();
							doc.fontSize(12).fillColor('black').text("Logs:", 65, 250);
							doc.fontSize(8).text(tests[j].log);
								
						}
					}
				}
				
				//Finish table of content
				doc.switchToPage(1);
				doc.moveDown();
				doc.fillColor('black').fontSize(12).text('Summary',75, 150);
				doc.fillColor('black').fontSize(12).text('Page '+summaryPage, 450, 150);
				doc.fillColor('black').fontSize(12).text('Results By Functional Area',75, 170);
				doc.fillColor('black').fontSize(12).text('Page '+reportPage, 450, 170);
				doc.fillColor('black').fontSize(12).text('Message Logs',75, 190);
				doc.fillColor('black').fontSize(12).text('Page '+logPage, 450, 190);
				
				//Add page numbers
				var range = doc.bufferedPageRange();
				for(var i = range.start; i < range.start + range.count; i++){
					if(i != 0){
						doc.switchToPage(i);
						doc.fontSize(8).text("Page "+(i + 1)+" of "+range.count, 470, 700);
					}
				}
				
				
				// end and display the document in the iframe to the right
				doc.end();
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			if(reports == null){
				return next(new Error('Reports does not exist.'));
			}
			
			//Fetch all build tests
			req.collections.tests.find({build_id : build.id}).toArray(findTests);
		};
		
		//Handle Error.
		if(error){
			return next(error);
		}
		
		if(build == null){
			return next(new Error('Build does not exist.'));
		}
		
		//Fetch Reports
		req.collections.reports.find({build_id : build.id}).toArray(findReports);
	};
	
	//Validate inputs.
	if(!req.params.build_id){
		return next(new Error('No build_id param in url.'));
	}
	
	//if(validator.isNull(req.params.build_id) || !validator.isLength(req.params.build_id, 5, 30) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
	if(validator.isNull(req.params.build_id) || !validator.matches(req.params.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Fetch Build
	req.collections.builds.findOne({id : req.params.build_id}, findBuild);
	
}
	
function durationToStr (milliseconds) {
	var result = '';
    var temp = Math.floor(milliseconds / 1000);

    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
    	result += days + ' d ';
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
    	result += hours + ' h ';
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
    	result += minutes + ' min ';
    }
    var seconds = temp % 60;
    if (seconds) {
    	result += seconds + ' sec ';
    }
    if(result == 0){
    	return milliseconds + ' ms ';
    }
    return result; 
}
	
/**
 * API path /api/tests/stat
 */
exports.stat = findStat; 

function findStat(req, res, next){
	var findTestCriterias = function (error, criterias){
		var aggregateTestStat = function (error, stat){
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Set name
			result.name = statName;
			
			//Set Values
			var values = [];
			for(var j = 0; j < stat.length; j++){
				values[j] = {name: stat[j][req.query.graph] == null? "Others": stat[j][req.query.graph] , value : stat[j].count};
			}
			result.values = values;
			
			//Send result.
			res.send({stat: result});
		};
		
		//Handle Error.
		if(error) {
			return next(error);
		}
		
		//Fetch the graph name that need to be returned.
		var statName;
		if(req.query.graph == 'status'){
			statName = "Status"
		}else if(req.query.graph == 'regression'){
			statName = "Regression"
		}else if(req.query.graph == 'time'){
			statName = "Time"
		}else{
			for(var i = 0; i < criterias.length; i++){
				var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
				if(currentCriterias == req.query.graph){
					statName = criterias[i].name;
				}
			}
		}
		
		//Create searchCriteria object.
		var searchCriterias = createSearchCriterias(req, criterias);
		
		//Fetch stats based on search criterias.
		req.collections.tests.group([req.query.graph],
			searchCriterias,
			{count: 0},
			"function(curr, prev){prev.count++;}", 
			aggregateTestStat);
	};
	
	//Validate inputs.
	if(!req.query.build_id || !req.query.graph) {
		return next(new Error('No build_id or graph query params.'));
	}
	if(validator.isNull(req.query.build_id) || !validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(!validator.isNull(req.query.report_id) && !validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.graph) || !validator.matches(req.query.graph, '[0-9a-zA-Z_-]+')){
		return next(new Error('graph param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	
	//Create response object.
	var result = {};
	
	//Fetch all test criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * Function that create a SearchCriterias object based on query param send in the URL.
 * This Object can be then used to filter result while using MongoDb apis.
 */
function createSearchCriterias(req, criterias){
	
	var searchCriterias = {};
	//Add static criterias to searchCriterias Object.
	if(!_.isNull(req.query.status) && !_.isEmpty(req.query.status)){
		searchCriterias.status = req.query.status;
	}
	if(!_.isNull(req.query.regression) && !_.isEmpty(req.query.regression)){
		searchCriterias.regression = req.query.regression;
	}
	if(!_.isNull(req.query.time) && !_.isEmpty(req.query.time)){
		searchCriterias.time = req.query.time;
	}

	//Add dynamic criterias to searchCriterias Object.
	//Loop through name criterias and convert name field value into searchCriteria attributes set with value fetched from request query.
	for(var i = 0; i < criterias.length; i++){
		var currentCriterias = replaceAll(" ", "_", criterias[i].name.toLowerCase());
		if(!_.isUndefined(req.query[currentCriterias]) && !_.isNull(req.query[currentCriterias]) && !_.isEmpty(req.query[currentCriterias])){
			searchCriterias[currentCriterias] = req.query[currentCriterias];
		}
	}
	if(req.query.report_id != null && req.query.report_id != '' && req.query.report_id != 'null'){
		searchCriterias.report_id = req.query.report_id;	
	}
	return searchCriterias;
}

/**
 * API path /api/tests/:test_id
 */
exports.view = findTest;

function findTest(req, res, next){
	var fetchTest = function (error, test){
	    //Handle Error.
		if(error) {
			return next(error);
		}
		var status = test.status;
		test.status = formatter.formatStatus(status);
		test.regression = formatter.formatRegression(status, test.regression);
		test.time = formatter.formatTime(test.time);
		//Send response.
	    res.send({test: test});
	};
	
	//Validate inputs.
	if(!req.params.test_id) {
		return next(new Error('No test_id param in url.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.isMongoId(req.params.test_id)){
		return next(new Error('test_id param should not be null and correspond to a MongoDB Id.'));
	}
	
	//Fetch test requested.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, fetchTest);
}

/**
 * API path /api/search/tests
 */
exports.search = findSearchedTests;

function findSearchedTests(req, res, next){
	var findTestCriterias = function (error, criterias){
		var findTests = function (error, tests){
			//Handle Error.
			if(error){
				return next(error);
			}
				
			//For each test, we add criterias values to allCriterias objects for each criteria names.
			for(var j = 0; j < tests.length; j++){
				var currentTest = tests[j];
			
				for(var index in allCriterias){
					convertedIndex = replaceAll(" ","_", index.toLowerCase());
					if(!_.isUndefined(currentTest[convertedIndex]) && !_.isEmpty(currentTest[convertedIndex]) && !_.isNull(currentTest[convertedIndex])){
						allCriterias[index][currentTest[convertedIndex]] = true;
					}
				}
			}
			
			//Convert the allCriterias object (Map<String, List>) to the result object (Array of objects with 2 attributes, name and values, values being of type String[])
			_.each(allCriterias, function addCriteriasNameToResult(element, index, list){
				result[i] = {};
				result[i].name = index;
				var l = 0;
				result[i].values = [];
				_.each(element, function addCriteriasValueToResult(value, index, list){
					result[i].values[l] = index;
					l++;
				}, result);
				i++;
			}, result);
			
			//Send result.
			res.send({criterias: result});
		};
		//Handle Error.
		if(error){
			return next(error);
		}
		
		//Add static criterias.
		allCriterias['Status'] = {};
		allCriterias['Regression'] = {};
		allCriterias['Time'] = {};
		
		//Add dynamic criterias.
		for(var j = 0; j < criterias.length; j++){
			var currentCriterias = criterias[j].name;
			allCriterias[currentCriterias] = {};
		}

		//Fetch all tests for this report or build.
		if(req.query.report_id != null){
			req.collections.tests.find({report_id: req.query.report_id}).toArray(findTests);
		}else{
			req.collections.tests.find({build_id: req.query.build_id}).toArray(findTests);
		}
	};
	
	//Validate inputs.
	if(validator.isNull(req.query.report_id) && validator.isNull(req.query.build_id)){
		return next(new Error('report_id or build_id param should be not null'));
	}
	if(!validator.isNull(req.query.report_id)){
		if(!validator.matches(req.query.report_id, '[0-9a-zA-Z_-]+')){
			return next(new Error(req.query.report_id+'report_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	if(!validator.isNull(req.query.build_id)){
		if(!validator.matches(req.query.build_id, '[0-9a-zA-Z_-]+')){
			return next(new Error('build_id param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
		}
	}
	if(validator.isNull(req.query.report_id) && validator.isNull(req.query.build_id)){
		return next(new Error("Either build_id or report_id should be defined"));
	}
	
	var allCriterias = {};
	var result = [];
	var i = 0;
	
	//Fetch all tests criterias.
	req.collections.testcriterias.find().toArray(findTestCriterias);
}

/**
 * API path /api/tests/history
 */
exports.history = findTestHistory; 

function findTestHistory(req, res, next){
	var findTest = function (error, test){
		var findTests = function (error, tests){
			var countTest = function (error, count){
				//Validate query result.
				if(error){
					return next(error);
				}
				if(_.isNull(count)){
					count = 0;
				}				
				
				result.recordsTotal = count;
				result.recordsFiltered = count;
				result.data = data;
				//Send result.
				res.send(result);
			};
			
			//Handle Error.
			if(error){
				return next(error);
			}
			
			//Populate the data array with tests found.
			for(var index in tests){
				data[index] = [
	               tests[index].build_id, 
	               tests[index].report_id, 
				   tests[index]._id, 
	               tests[index].start_date, 
	               formatter.formatTime(tests[index].time),
	               formatter.formatStatus(tests[index].status)]; 
			}
			
			//Count number of retuned tests and send response.
			req.collections.tests.count({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }}, countTest);
		}
		
		if(error){
			return next(error);
		}
		
		//fetch build name
		var test_name = test.name;
		var build_name = test.build_name;
		
		//Fetch all test criterias.
		req.collections.tests.find({name: test_name, build_name: build_name, start_date : { $lte : test.start_date }})
			.sort({start_date: -1})
			.skip(parseInt(req.query.start)).limit(parseInt(req.query.length))
			.toArray(findTests);
	}

	//Validate inputs.
	if(!req.query.draw || !req.query.length || !req.query.start){
		return next(new Error('No draw, length, start query params.'));
	}
	if(validator.isNull(req.params.test_id) || !validator.matches(req.params.test_id, '[0-9a-zA-Z_-]+')){
		return next(new Error('build_name param should not be null and match the following regex pattern [0-9a-zA-Z_-]+ .'));
	}
	if(validator.isNull(req.query.draw) || !validator.isInt(req.query.draw)){
		return next(new Error('draw param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.length) || !validator.isInt(req.query.length)){
		return next(new Error('length param should not be null and should be a number.'));
	}
	if(validator.isNull(req.query.start) || !validator.isInt(req.query.start)){
		return next(new Error('start param should not be null and should be a number.'));
	}
	
	//Create response object.
	var result = {};
	//Set draw value.
	result.draw = req.query.draw;
	//Create data obejct array.
	var data = [];

	//Fetch all test criterias.
	req.collections.tests.findOne({_id: mongoskin.helper.toObjectID(req.params.test_id)}, findTest)
}

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

