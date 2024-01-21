<?php
$var_email = $_POST['inputEmail'];
$var_subject = $_POST['inputSubject'];
$var_text = $_POST['inputEmailText'];

$msg = "Message";
$msg = wordwrap($msg,70);
$headers = "From: Receiptica <email>";


if(mail($var_email, $var_subject, $var_text, $headers)){
    echo "Mail envoyé !";
} else{
    echo "Erreur !";
}
?>