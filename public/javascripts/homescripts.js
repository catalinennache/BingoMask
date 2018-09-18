

document.onreadystatechange = function () {
    window.scrollTo(0, 0)
    initToaster();
    window.setTimeout(function() {
        document.body.classList.remove('is-preload');
      }, 100);
}








    let btn = document.getElementsByClassName('sup')[0];
btn.addEventListener('click', function (ev) {
    if (ev.target.innerHTML == "Sign Up") {
        $(document.getElementsByClassName('loginwrp')[0]).fadeOut(400);
        setTimeout(function () {
            $(document.getElementsByClassName('loginwrp')[1]).fadeIn(400)
            document.getElementsByClassName('image')[0].style.height = "25em";
            ev.target.innerHTML = "Log In";
        }, 401);
    } else {
        $(document.getElementsByClassName('loginwrp')[1]).fadeOut(400);
        setTimeout(function () {
            $(document.getElementsByClassName('loginwrp')[0]).fadeIn(400);
            ev.target.innerHTML = "Sign Up";
            document.getElementsByClassName('image')[0].style.height = "18em";
        }, 401)
    }
})

document.getElementById('nick').addEventListener('change', function (ev) {
    if (ev.target.value != "") {
        if (ev.target.value.length > 2) {
            $.ajax({
                type: "post",
                url: "http://86.123.134.100:3000/check",
                data: { nick: ev.target.value },
                success: function (data) {
                    console.log(data, data['available'], data['available'] == 1);

                    if (data['available'] == 1) {
                        document.getElementById('nick').style.border = "1px solid green";
                        document.getElementById('nick').title = "";
                    } else {
                        document.getElementById('nick').style.border = "1px solid red";
                        document.getElementById('nick').title = "Nick Name is already in use.";
                        window.toaster.toast(data['message']);

                    }
                }

            })
        } else {
            document.getElementById('nick').style.border = "1px solid red";
            document.getElementById('nick').title = "Nick Name is too short.";
            window.toaster.toast("Nick Name is too short.")
        }
    } else {
        document.getElementById('nick').style.border = "solid 1px rgba(255, 255, 255, 0.3)";

    }
})

