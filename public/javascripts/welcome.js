'use strict';
window.onload=function(){
let signin= document.getElementsByClassName('sin');
for (let s=0;s<signin.length;s++)
    {  console.log(s,signin[s]);
        signin[s].addEventListener('click',function (ev){
        document.getElementsByClassName('wrapper')[0].style.opacity="0";
        console.log("event happend",ev);
        setTimeout(function(){
            document.getElementsByClassName('wrapper')[0].style.display="none";
            new LoginForm();

        },500);
    })}}


// Get the modal
var modal = document.getElementById('signin');

// Get the button that opens the modal
var btn = document.getElementById("si-btn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    alert('clicked');
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

class LoginForm{
    constructor(){
        this.core=document.createElement('form');
        this.core.method="Post";
        this.core.action="";
        this.core.classList="SignInForm";
        let imag=document.createElement('img');
        imag.src=window.location.href+"images/profile.png";
        imag.setAttribute('width',"130px");
        imag.style.filter="invert(1)";
        imag.style.marginBottom="20px";
        this.core.appendChild(imag);

        let nameField=document.createElement('input');
        nameField.type="text";
        nameField.name="user";
        nameField.placeholder="User";
        this.core.appendChild(nameField);

        let passField=document.createElement('input');
        passField.type="password";
        passField.name="pass";
        passField.placeholder="Password"
        this.core.appendChild(passField);

        let submit=document.createElement('input');
        submit.type="submit";
        submit.name="submitbtn";
        this.core.appendChild(submit);
        this.core.style="opacity:0;transition-duration:1s;";

        this.Present();
    }

    Present() {
        document.getElementsByClassName('well')[0].insertBefore(this.core,document.getElementsByClassName('wrapper')[0]);
       setTimeout(function(){ this.core.style.opacity="1";}.bind(this),500);
    }
}    