
function uploadFile()
{
    var form_data = new FormData( document.getElementById( "upload_form" ) );
        
    $.ajax( { url: "./upload",
              type: "POST",
              data: form_data,
              contentType: false,
              cache: false,
              processData: false,
              async: true,
              dataType : "json",
              complete : function( result )
              {
                  var result_json = result["responseJSON"] ? result["responseJSON"] : null;
                  if( !result_json )
                  {
                      alert( "Unexpected result returned from /upload" );
                      return;
                  }
                 
                  var error_str = result_json["error_str"] ? result_json["error_str"] : "";
                  if( error_str )
                  {
                      alert( error_str );
                      return;
                  }
                  
                  var cos_key = result_json["cos_key"] ? result_json["cos_key"] : "";
                  if( !cos_key )
                  {
                      alert( "No COS key was returned" );
                      return;
                  }
                  
                  messageChatbot( "COS_" + cos_key );
                  
              }
                         
            } );
            
}



/*
 *
 * Watson Assistant 
 * 
 */
 
 
var g_wa_instance;


function setUpChatbot()
{
    const t=document.createElement('script');
    t.src="https://web-chat.global.assistant.watson.appdomain.cloud/loadWatsonAssistantChat.js";
    document.head.appendChild(t);
    
    window.watsonAssistantChatOptions = {
        integrationID     : document.getElementById( "wa_integration_id" ).value,
        region            : document.getElementById( "wa_region" ).value,
        serviceInstanceID : document.getElementById( "wa_service_instance_id" ).value,
        onLoad: function( instance )
        {
            g_wa_instance = instance;
            
            instance.render();
        }
    };

}
  

function messageChatbot( txt )
{
    // https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods#send
    //
    
    var send_obj = { "input": { "message_type" : "text", "text" : txt } };
    
    g_wa_instance.send( send_obj, {} ).catch( function( error ) 
    {
      console.error( "Sending message to chatbot failed" );
      
    } );
}



