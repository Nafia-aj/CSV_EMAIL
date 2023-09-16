function sendEmails(event) {
    event.preventDefault();

    var subject = document.getElementById("subject").value;
    var content = document.getElementById("content").value;
    var attachment = document.getElementById("attachment").files[0];
    var csvFile = document.getElementById("csvFile").files[0];
    var emailInput = document.getElementById("emails").value;

    console.log("Attachment:", attachment);

    if (!csvFile && !emailInput) {
        alert("Please select a CSV file or enter email addresses.");
        return;
    }

    var emailAddresses = emailInput.split(',');

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

                    sendEmailsToAddresses(emailAddresses, subject, content, attachment);
                }
            });
        };
        reader.readAsText(csvFile);
    } else {
        sendEmailsToAddresses(emailAddresses, subject, content, attachment);
    }
}

function sendEmailsToAddresses(emailAddresses, subject, content, attachment) {
    emailAddresses.forEach(function (to) {
        var formData = new FormData();
        formData.append("to", to.trim()); // Trim to remove leading/trailing spaces
        formData.append("subject", subject);
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
            return response.json(); // Assuming the server returns JSON
        })
        .then(data => {
            alert("Message sent successfully");
            document.getElementById('subject').value = '';
            document.getElementById('content').value = '';
            document.getElementById('csvFile').value = '';
            document.getElementById('attachment').value = '';
            document.getElementById('emails').value = '';
        })
        .catch(error => {
            console.error('Error sending message:', error);
            alert("Error sending message: " + error.message);
        });
    });
}