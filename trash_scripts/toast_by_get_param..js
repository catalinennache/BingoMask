	<script>
				<% if (err) {%>
			let err_code = "<%= err  %>";
			if (err_code.startsWith("su")) {
				console.log("SUU");
				document.getElementsByClassName('loginwrp')[0].style.display = "none";
				document.getElementsByClassName('loginwrp')[1].style.display = "block";
				document.getElementsByClassName('image')[0].style.height = "25em";
				document.getElementsByClassName('sup')[0].innerHTML = "Log In";
			}
			$.ajax({
				type: "post",
				url: "http://localhost:3000/errdic",
				data: { code: err_code },
				success: function (data) {
					let toast = document.getElementById('snackbar')
					toast.innerHTML = data['message'];
					toast.className = "show";
					setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 8000);
				},
				error: function (data) {

				}

			}) <%}%>

	</script>