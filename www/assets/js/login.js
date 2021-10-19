$(document).ready(function(){
    var debugMode = 1;

    //Prevent form Submission
	$("form").submit(function(e){
		e.preventDefault();
	});



    $("#form-signin").submit(function(e){
        // Clear Message 
        document.getElementById("loginMessage").innerHTML = "&nbsp;";
        document.getElementById("loginMessage").innerHTML = "Checking Credentials . . .";

        e.preventDefault();
        
        //
        // Create Json Object from Form Data
        //
        $.fn.serializeObject = function()
        {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        };
        //
        // END Create Json Object from Form Data
        //
        
        var formData = JSON.stringify($(this).serializeObject());

        $.ajax({
            url : "/authenticate",
            type: "POST",
            data : formData,
            contentType: "application/json",
            success: function(data, textStatus, jqXHR)
            {
                //Output if Debig ON
                if (debugMode == 1) { console.log(data); }
                try { 
                    var parsed = JSON.parse(data);
                    if (parsed.Credentials == "Invalid"){
                        document.getElementById("loginMessage").innerHTML = "<span class='text-danger'>Invalid Login</span>";
                    } else if (parsed.Credentials == "Valid"){
                        document.getElementById("loginMessage").innerHTML = "Login Accepted";
                        window.location.href = "/api/default";
                    }
                } catch(error) {
                    console.log(error);
                }
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
                document.getElementById("loginMessage").innerHTML = "Something went wrong.";
                console.log(errorThrown);
            }
        });
    });

});