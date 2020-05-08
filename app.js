'use strict';

let fs = require('fs');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
var cfenv = require('cfenv');

var mongoose = require('mongoose');

var models = require('./models/models.js');
var Patient = models.patientModel;
var Doctor = models.doctorModel;
var Pharmacist = models.pharmacistModel;

mongoose.connect('mongodb://sssaini1:sssaini1@ds231725.mlab.com:31725/medical-chain');

app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

var patient = "Anthony";
var doctor = "1";
var pharmacist = "pharmacist";
var drug1 = '', drug2 = '';
var duplicateArray = [];

app.use(function(req, res, next) {
	next();
})


app.engine('html', require('ejs').renderFile);


app.get('/', function(req, res) {


	res.render('patSum.ejs');
});

app.get('/patSum', function(req, res) {
	res.render('patSum.ejs')
})

app.post('/patDisp', function(req, res) {
	console.log("Finding patient" + req.body.name);
	patient = req.body.name;
	Patient.find({
		"name": req.body.name
	}, function(err, doc) {
		console.log(doc);
		res.render('patDisp.ejs', {
			doc,
		});
	});
});

app.post('/transVerif', function(req, res) {
	console.log("Doctor");
	console.log(req.body);

	doctor = "1";
	if (req.body.disease1 === "Hepatitis") { doctor = "1"; } else { doctor = "2"; }

	var options = {
		safe: true,
		upsert: true
	};

	var update = {
		$push: {
			diseases: req.body.disease1,
			comments: "Booked appointment",
		}
	};

	Patient.findOneAndUpdate({
		"name": req.body.name
	}, update, options, function(err, doc) {
		if (err) {
			console.log('error' + err);
		} else {
			console.log('saved');
		}

	});
	var query = Patient.findOne({
		"name": req.body.name
	}, {}, function(err, doc) {
		if (err) {
			console.log('error' + err);
		}
	});

	query.then(function(doc2) {
		console.log("patient found" + doc2);

		var update2 = {
			$push: {
				patients: doc2._id
			}
		};

		var query2 = Doctor.findOneAndUpdate({
			"name": doctor
		}, update2, options, function(err, doc) {
			if (err) {
				console.log('error' + err);
			} else {
				console.log('saved');

				console.log("____________")
				console.log(doc)

				res.render('transVerif.ejs', {
					doc,
					patient: doc2
				});
			}
		});
	});
});

app.post('/docDisp', function(req, res) {
	console.log("finding patient" + patient);


	var query = Patient.findOne({
		"name": patient
	}, {}, function(err, doc) {
		if (err) {
			console.log('error' + err);

		}
	})


	query.then(function(doc) {

		console.log("doctor" + doc);


		var query2 = Doctor.findOne({
			"name": doctor
		}, {}, function(err, doc) {
			if (err) {
				console.log('error' + err);
			}
		})

		query2.then(function(doc2) {
			res.render('docDisp.ejs', {
				doc: doc2,
				patient: doc
			});
		});
	});

});

app.post('/pharmDisp', function(req, res) {
	var date = new Date().toDateString().substring(4);
	duplicateArray = [];
	drug1 = req.body.drug1;
	drug2 = req.body.drug2;

	console.log("***** Body: %j", req.body);
   var comments = req.body.comments;

	console.log("finding patient" + patient);
	console.log("doctor " + doctor);

	var query3 = Doctor.findOne({
		"name": doctor
	}, "name age patients", function(err, doc) {
		if (err) {
			console.log('error' + err);
		}
	})

	query3.then(function(doc) {

		var options = {
			safe: true,
			upsert: true
		};

		console.log(doc);
		var update2 = {
			$push: {
				drugs: { $each: [drug1, drug2] },
				comments: { $each: ["Prescription " + drug1 + " " + drug2, comments] },
			}
		};

		Patient.findOneAndUpdate({
			"name": patient
		}, update2, options, function(err, doc) {
			if (err) {
				console.log('error' + err);
			} else {
				console.log('Patient found');
			}
		});

		var options = {
			safe: true,
			new: true
		};
		var update2 = {
			$push: {
				customers: { patient: doc.patients[0], doctor: doc._id }
			}
		};

		Pharmacist.findOneAndUpdate({
			"name": pharmacist
		}, update2, options, function(err, doc) {
			if (err) {
				console.log('error' + err);
			} else {
				console.log('Pharmacist found');

				console.log("name: " + doc.customers[0].patient);

				var query4 = Patient.findById(
					doc.customers[0].patient,
					function(err, doc3) {
						if (err) {
							console.log('error' + err);
						}
						patient = doc3;
					})
					.then(function(doc3) {
						console.log('Patient');
						for (var i = 0; i < patient.drugs.length; i++) {
							for (var j = i + 1; j < patient.drugs.length; j++) {
								if (patient.drugs[i] === patient.drugs[j]) {
									console.log('i:' , i , '/ patient drugs:' , patient.drugs[i]);
									console.log('j:' , j , '/ patient drugs:' , patient.drugs[j]);
									duplicateArray.push(patient.drugs[i]);
									console.log(duplicateArray);
									patient.drugs.splice(j, 1);
									j = patient.drugs.length;
								}
							}
						}
						doc3.drugs = patient.drugs;
						doc3.save(function(err, doc) {
							if (err) return handleError(err);
						});
						console.log('Duplicate arr');
						console.log(duplicateArray);
						res.render('pharmDisp.ejs', {
							drug1,
							drug2,
							doc: doc,
							duplicateArray,
							patient: doc3,
							date,
					});
				});
			};
		});
	});
});

var appEnv = cfenv.getAppEnv();
app.listen(appEnv.port, '0.0.0.0', function() {
	console.log("visit server at" + appEnv.url);
});