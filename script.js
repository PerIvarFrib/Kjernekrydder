const bImg = document.getElementsByClassName("background-img")[0];
const bVideo = document.getElementsByClassName("background-video")[0];
const mainContent = document.getElementsByClassName("main-content")[0];
const home = document.querySelector('#page-one');
const wrapper = document.getElementsByClassName("wrapper")[0];
const playButton = document.getElementById("playButton");

document.addEventListener('DOMContentLoaded', function() {
    playButton.classList.remove('hidden');
});

wrapper.addEventListener('click', function(){
    playButton.classList.toggle('toggle-test');
    bImg.classList.add('background--fade-down');
    playButton.classList.add('background--fade-down');
    bVideo.classList.add('background--video-in');
});

let hasScrolled = false;
const observer = new IntersectionObserver(entries => {
    entry = entries[0];
    console.log(entry.isIntersecting);
    if (!hasScrolled){
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    } else {
        mainContent.classList.toggle('lighten', entry.isIntersecting);
        mainContent.classList.toggle('darken', !entry.isIntersecting);
    }
    if (!hasScrolled && !entry.isIntersecting){hasScrolled = true;}
}, {threshold:0.5});
observer.observe(home);

bImg.addEventListener('animationend', function(){
    bVideo.play();
    setTimeout(() => {
        if (!hasScrolled){
            document.getElementById("hero").scrollIntoView({behavior: "smooth"});
        }
    }, 3000);
})