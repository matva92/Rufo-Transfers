function myFunction(boton,id) {
    var dots = document.getElementById("dots"+id);
    var moreText = document.getElementById("more"+id);
    // var btnText = document.getElementById("myBtn");

    if (dots.style.display === "none") {
      dots.style.display = "inline";
      // btnText.innerHTML = "Leer mas";
      boton.innerHTML = "Leer mas";
      moreText.style.display = "none";
    } else {
      dots.style.display = "none";
      // btnText.innerHTML = "Leer menos";
      boton.innerHTML = "Leer menos"
      moreText.style.display = "inline";
    }
  }