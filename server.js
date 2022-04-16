
const g_http    = require( "http"        );
const g_express = require( "express"     );
const g_multer  = require( "multer"      );
const g_fs      = require( "fs"          );
const g_cos     = require( "ibm-cos-sdk" );


const g_cos_bucket = process.env.COSBUCKET;
const g_cos_config = { 
    endpoint          : process.env.COSENDPOINT,
    apiKeyId          : process.env.COSAPIKEY,
    ibmAuthEndpoint   : process.env.COSIBMAUTHENDPOINT,
    serviceInstanceId : process.env.COSSERVICEINSTANCEID,
    signatureVersion  : 'iam' 
};
var g_cos_client = new g_cos.S3( g_cos_config );

const g_wa_integration_id      = process.env.WAINTEGRATIONID;
const g_wa_region              = process.env.WAREGION;
const g_wa_service_instance_id = process.env.WASERVICEINSTANCEID;


var g_app = g_express();
g_app.use( g_express.static( __dirname + '/public' ) );
g_app.set( "view engine", "ejs" );


const g_server = g_http.Server( g_app );
g_server.listen( 8080, function()
{
  console.log( "\nServer running" );
  
} );


g_app.get( '/chatbot', function( request, response )
{
    console.log( "\n/chatbot ..." );
    
    response.render( 'pages/chatbot', { "wa_integration_id"      : g_wa_integration_id,
                                        "wa_region"              : g_wa_region,
                                        "wa_service_instance_id" : g_wa_service_instance_id } );
    
} );


var storage = g_multer.diskStorage(
{
    destination: function( request, file, callback )
    {
        callback( null, './uploads/' );
    },
    
    filename: function( request, file, callback )
    {
        callback( null, Date.now() + '_' + file.originalname );
    }

} );

var g_upload = g_multer( { storage : storage } );

g_app.post( "/upload", g_upload.single( 'uploaded_file' ), function( request, response )
{
    console.log( "\n/upload..\n" +
                 "request.file:\n" +
                 JSON.stringify( request.file, null, 3 ) );
                 
    var file_name = request.file.filename;
    var file_path = request.file.path;
    
    var params = { Bucket : g_cos_bucket, 
                   Key    : file_name, 
                   Body   : g_fs.createReadStream( file_path ) };
    
    g_cos_client.upload( params ).promise().then( function()
    {
        console.log( "\n/upload..\n" +
                     "Saving in COS complete.\n" +
                     "Key: " + file_name );
                     
        response.status( 200 ).end( JSON.stringify( { "cos_key" : file_name }, null, 3 ) );
        
    } )
    .catch( function( err )
    {
        response.status( 500 ).end( JSON.stringify( { "error_str" : err.message }, null, 3 ) );
        
    } );
    
} );






