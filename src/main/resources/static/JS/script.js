function sendEmails(event) {
    event.preventDefault();

    var subject = document.getElementById("subject").value;
    var content = document.getElementById("content").value;
    var attachment = document.getElementById("attachment").files[0];
    var csvFile = document.getElementById("csvFile").files[0];

    console.log("Attachment:", attachment);

    if (!csvFile) {
        alert("Please select a CSV file.");
        return;
    }

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
                        var formData = new FormData();
                        formData.append("to", row.email);
                        formData.append("subject", subject);
                        formData.append("content", content);
                        formData.append("csvFile", csvFile);

                        if (attachment) {
                            formData.append("attachment", attachment);
                        }

                        fetch('/api/send-email', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            alert("Message sent successfully");
                            document.getElementById('subject').value = '';
                            document.getElementById('content').value = '';
                            document.getElementById('csvFile').value = '';
                            document.getElementById('attachment').value = '';
                        })
                        .catch(error => {
                            console.error('Error sending message:', error);
                            alert("Error sending message");
                        });
                    }
                });
            }
        });
    };
    reader.readAsText(csvFile);
}