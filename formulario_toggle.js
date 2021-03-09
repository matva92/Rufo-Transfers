$("li .cotizar").click(function() {  
    // console.log("testing");
    $(".formulario").toggleClass("hidden");
});

$("li .cotizar2").click(function() {  
    // console.log("testing");
    $(".formulario").toggleClass("hidden");
    $(".toggler").prop("checked", false);
});

$(".close").click(function() {  
    // console.log("testing");
    $(".formulario").toggleClass("hidden");
});