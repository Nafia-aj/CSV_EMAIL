function sendEmails(event) {
    event.preventDefault();

    var subject = document.getElementById("subject").value;
    var content = document.getElementById("content").value;
    var attachment = document.getElementById("attachment").files[0];
    var csvFile = document.getElementById("csvFile").files[0];
    var emailInput = document.getElementById("emails").value;
    var template = document.getElementById("template").value;

    console.log("Attachment:", attachment);

    if (!csvFile && !emailInput) {
        alert("Please select a CSV file or enter email addresses.");
        return;
    }

    var emailAddresses = [];

    if (emailInput) {
        emailAddresses = emailInput.split(',');
    }

    if (csvFile) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var csvText = e.target.result;

            Papa.parse(csvText, {
                delimiter: ",",
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function (results) {
                    if (results.errors.length > 0) {
                        console.error("Error parsing CSV:", results.errors);
                        return;
                    }

                    results.data.forEach(function (row) {
                        if (row.email) {
                            emailAddresses.push(row.email);
                        }
                    });

                    sendEmailsToAddresses(emailAddresses, subject, content, attachment, template);
                }
            });
        };
        reader.readAsText(csvFile);
    } else {
        sendEmailsToAddresses(emailAddresses, subject, content, attachment, template);
    }
}

function sendEmailsToAddresses(emailAddresses, subject, content, attachment, template) {

    function sendEmail(to) {
        var formData = new FormData();
        formData.append("to", to.trim());
        formData.append("subject", subject);

        if (template === "default") {
            content = content;
        } else if (template === "option2") {
            content = "Dear Artist,\n\n" + content;
        } else if (template === "option3") {
            var name = to.split('@')[0];
            content = "Dear " + name + ",\n\n" + content;
        }

        formData.append("content", content);

        if (attachment) {
            formData.append("attachment", attachment);
        }

        fetch('/api/send-email', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('File size exceeds the allowed limit.');
                } else {
                    throw new Error('Network response was not ok');
                }
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
    }

    emailAddresses.forEach(function (to) {
        sendEmail(to);
    });

    setTimeout(function() {
        alert( " messages sent successfully");
        document.getElementById('subject').value = '';
        document.getElementById('content').value = '';
        document.getElementById('csvFile').value = '';
        document.getElementById('attachment').value = '';
        document.getElementById('emails').value = '';
        document.getElementById('template').value = 'default';
    }); 
}
