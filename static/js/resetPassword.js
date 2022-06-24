let togglePassword = document.getElementById("togglePassword");
let password = document.getElementById("password1")

togglePassword.addEventListener("click",()=>{
    let type = password.getAttribute("type")==='password'?"text":"password" ;
    password.setAttribute("type",type);
    togglePassword.classList.toggle('bi-eye')
})