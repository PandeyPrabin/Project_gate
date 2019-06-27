const getWidth = () => {
  const frontContainer = document.getElementById("frontContainer");
  const timeContainer = document.getElementById("timeContainer");
  const innerTimeContainer = document.getElementById("innerTime");
    
/*Changing element's classes and margins,
    if the window's width goes under a certain ammount of pixels.*/
  window.innerWidth >= 830 ? 
  (frontContainer.className = "ui grid", innerTimeContainer.style.marginRight= "1rem") : 
  (frontContainer.className = "ui",
  timeContainer.style.marginTop = "1rem",
  innerTimeContainer.style.marginRight = "0",
  frontContainer.style.margin = "0 1rem 0 1rem");
  };
  
const runOnStart = () => {
/*Adding onload event so page knows user's window width
  before the user sees DOM. */
  window.onload = getWidth;
  addEventListener('resize', getWidth); /* Update elements on window resize.*/
};
runOnStart();