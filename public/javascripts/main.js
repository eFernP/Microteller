'use strict';

const main = () => {
    const idNote = document.querySelector(".ajax-id");

    document.getElementById("ajax-form").addEventListener('click', postAddFav);

    function postAddFav(event) {
        event.preventDefault();
        let heart = document.getElementById('full-heart');
        let number = document.getElementById('fav-number');
        let heartImg = document.getElementById('heart-img');
        if(heart){
            const id = idNote.attributes[2].nodeValue;
            heartImg.src = '/images/empty-heart.png';
            heart.id = "empty-heart";
            let intNumber = parseInt(number.innerText);
            intNumber--;
            number.innerText = intNumber;
            axios.post('http://localhost:3000/letters/remove-favorite', { id })
                .then(response => {
                    console.log("You just created this character: ", response.data);
    
                })
                .catch(error => {
                    console.log("Error is: ", error);
                })
        }else{
            const id = idNote.attributes[2].nodeValue;
            heart = document.getElementById('empty-heart');
            heartImg.src = '/images/full-heart.png';
            heart.id = "full-heart";
            let intNumber = parseInt(number.innerText);
            intNumber++;
            number.innerText = intNumber;
            axios.post('http://localhost:3000/letters/add-favorite', { id })
                .then(response => {
                    console.log("You just created this character: ", response.data);
    
                })
                .catch(error => {
                    console.log("Error is: ", error);
                })
        }
        
    }
};


window.addEventListener('load', main);
