var express = require("express");
//important, change nano url to send to own couchdb - includes user:pass if authentication needed
var bodyParser = require("body-parser");
var app = express();
var mysql = require('mysql');
var mydb
var connection;

//get cookie for couch auth
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'soils-node',
    password: 'qICCAFLFbnXm4jQy',
    database: 'soils'
})

//used to get the body from the post in correct format
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//get function to return up status
app.get('/', function (req, res) {
    console.log('get request received')
    res.send('Soils post-receiver working');
});

//function to look at what route being used (url/db/[name])
//if request is a post and db name exists it adds record
app.use('/db/:name', function (req, res, next) {
    console.log("SOMETHING");
    console.log('db name:', req.params.name);
    console.log('Request Type:', req.method);
    console.log('Request URL: ', req.originalUrl);

    if (req.method === 'POST') next();
}, function (req, res, next) {

    console.log('record received, post noticed');
    console.log(req.body);
    var data = req.body;

    ////////////// FOR INTAKE FORM

    if (req.params.name == "intake") {

        //if new farmer, add new farmer record
        if (data['na_selected_farmer_id'] == '99') {
            console.log('new farmer noticed');
            var sql_farmer = "INSERT INTO farmers SET ?";
            console.log(sql_farmer);
            var val_farmer = {
                farmer_id: data['farmer_id'],
                farmer_name: data['farmer_name'],
                community_id: data['community_id']
            };

            var farmer_query = connection.query(sql_farmer, val_farmer, function (error, results, fields) {
                if (error) throw error;
                console.log("Farmer with id " + data['farmer_id'] + " added to the database");
            });
            console.log('farmer_query', farmer_query)
        }

        //create array for plots
        var plotValues = [];
        console.log(data['plot_info']);
        //for each plot:
        for (var x = 0; x < data['plot_info'].length; x++) {

            if (data['plot_info'][x]['plot_info/na_selected_plot_id'] == '99') {
                plotValues[x] = {
                    plot_id: data['plot_info'][x]['plot_info/plot_id'],
                    plot_name: data['plot_info'][x]['plot_info/plot_name'],
                    plot_gradient: data['plot_info'][x]['plot_info/plot_gradient'],
                    farmer_kn_soil: data['plot_info'][x]['plot_info/farmer_knowledge_soil_type'],
                    soil_texture: data['plot_info'][x]['plot_info/soil_texture'],
                    farmer_id: data['farmer_id'],
                    // data['plot_info'][x]['plot_name'],
                    // data['plot_info'][x]['plot_name'],
                    // data['plot_info'][x]['plot_name'],
                    // data['plot_info'][x]['plot_name'],
                };

                var sql_plot = "INSERT INTO plots SET ?";

                connection.query(sql_plot, plotValues[x], function (error, results, fields) {
                    if (error) throw error;
                    console.log("New plots added");
                    console.log("Affected rows = " + results.affectedRows);
                });
            }

            //create array for samples
            var sampleValues = [];
            sampleValues[x] = [];
            console.log("sample data for this plot = ");
            console.log(data['plot_info'][x]['plot_info/sample_info']);

            //for each sample within this plot...
            for (var y = 0; y < data['plot_info'][x]['plot_info/sample_info'].length; y++) {
                //create sampleValues[x][y] variable;

                sampleValues[x][y] = {
                    sample_id: data['plot_info'][x]['plot_info/sample_info'][y]['plot_info/sample_info/sample_id'],
                    sampling_date: data['plot_info'][x]['plot_info/sample_info'][y]['plot_info/sample_info/sampling_date'],
                    sampling_depth: data['plot_info'][x]['plot_info/sample_info'][y]['plot_info/sample_info/sampling_depth'],
                    sample_comments: data['plot_info'][x]['plot_info/sample_info'][y]['plot_info/sample_info/sample_comments'],
                    plot_id: data['plot_info'][x]['plot_info/plot_id'],
                    collector_name: data['data_collector']
                }
                //set up sql_sample
                var sql_sample = "INSERT INTO samples SET ?";

                //make connection and insert sampleValues into database. All guaranteed new samples. (!)
                connection.query(sql_sample, sampleValues[x][y], function (error, results, fields) {
                    if (error) throw error;
                    console.log("New samples added");
                    console.log("Affected sample rows = " + results.affectedRows);

                })

            }

        }

        res.sendStatus(200)

    } //end of intake form


    ///////// FOR POXC FORM

    if (req.params.name == "poxc") {

        poxc = {
            sample_id: data['sample_id'],
            analysis_date: data['today'],
            weight_soil: data['Weight_soil_in'],
            colorimeter: data['Reading_Colorimeter'],
            colorimeter_100: data['Reading_100percent'],
            conc_digest: data['conc_digest_solution'],
            comment_cloudy: data['Comment_Cloudy_solution'],
            colorimeter_calc: data['colorimeter_calc'],
            raw_conc_extract: data['Raw_conc_extract'],
            poxc_insample: data['mg_POXC_inSample'],
            poxc_insoil: data['mg_kg_Conc_POXC_in_Soil'],
            soil_moisture: data['estimated_soilmoisture'],
            poxc_corrected_moisture: data['corrected_forMoist_mg_kg_POXC']
        }

        sql = "INSERT INTO analysis_poxc SET ?";

        connection.query(sql, poxc, function (error, results, fields) {
            if (error) throw error;
            console.log("new analysis results added");
            console.log("Affected poxc rows = " + results.affectedRows);

            res.sendStatus(200);
        })
    }
    
    ///////// FOR pH FORM
    // table fields on left, schema on right
    if (req.params.name == "ph") {

        ph = {
            sample_id: data['sample_id'],
            analysis_date: data['today'],
            weight_soil: data['Weight_soil_in'],
            volume_water: data['Volume_water_used'],
            colorimeter_100: data['Reading_100percent'],
            ph: data['Reading_pH_meter'],
            comment_ph_stability: data['Comment_pH_stability'],
        }

        sql = "INSERT INTO analysis_ph SET ?";

        connection.query(sql, ph, function (error, results, fields) {
            if (error) throw error;
            console.log("new analysis results added");
            console.log("Affected ph rows = " + results.affectedRows);

            res.sendStatus(200);
        })
    }

    ///////// FOR P FORM
    // table fields on left, schema on right
    if (req.params.name == "p") {
        
                p = {
                    sample_id: data['sample_id'],
                    analysis_date: data['today'],
                    weight_soil: data['Weight_soil_in'],
                    volume_filtered_extract: data['Volume_filtered_extract'],
                    volume_topup: data['Volume_topup'],
                    colorimeter_100: data['Reading_100percent'],
                    colorimeter: data['Reading_Colorimeter'],
                    comment_cloudy_solution: data['Comment_Cloudy_solution'],
                    raw_conc_extract: data['Raw_conc_extract'],
                    soil_conc_olsen: data['Soil_conc_Olsen_P'],
                    raw_rounded: data['Raw_rounded'],
                    soil_conc_rounded: data['Soil_conc_rounded'],
                    
                }
        
                sql = "INSERT INTO analysis_p SET ?";
        
                connection.query(sql, p, function (error, results, fields) {
                    if (error) throw error;
                    console.log("new analysis results added");
                    console.log("Affected p rows = " + results.affectedRows);
        
                    res.sendStatus(200);
                })
            }





});


//function to make app listen on port 3000
app.listen(3000, function () {
    console.log("Started on PORT 3000");
})
