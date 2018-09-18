
console.log("PASSED");
function initToaster() {
    console.log("Initializing toast");
    if (!window.toaster)
        window.toaster = new SnackBar();

}

class SnackBar {

    

    constructor() {
        this.snackBar = document.createElement('div');
        this.snackBar.id="snackbar";
        document.body.appendChild(this.snackBar);
    }

    toast(message) {
        this.snackBar.innerHTML = message;
        this.snackBar.className = "show";
        setTimeout(function () {  this.snackBar.className =  this.snackBar.className.replace("show", ""); 
    console.log(this.snackBar);
    }.bind(this), 2500);
    }

}