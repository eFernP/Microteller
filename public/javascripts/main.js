'use strict';

const main = () => {
    const idNote = document.querySelector('.ajax-id');

    const commentForm = document.getElementById('comment-form');
    if (commentForm){
        commentForm.addEventListener('click', addComment);
    }
    
    const ajaxForm = document.getElementById('ajax-form');
    if(ajaxForm){
        ajaxForm.addEventListener('click', postAddFav);
    }
    
    const voteForm = document.getElementById("vote-form");
    if (voteForm){
        voteForm.addEventListener('click', postVote);
    }
    
    function postAddFav(event) {
        event.preventDefault();
        let heart = document.getElementById('full-heart');
        let number = document.getElementById('fav-number');
        let heartImg = document.getElementById('heart-img');
        if (heart) {
            const id = idNote.attributes[2].nodeValue;
            heartImg.src = '/images/empty-heart.png';
            heart.id = "empty-heart";
            let intNumber = parseInt(number.innerText);
            intNumber--;
            number.innerText = intNumber;
            axios.post('https://project2ed.herokuapp.com/letters/remove-favorite', { id })
                .then(response => {
                    console.log("You just created this character: ", response.data);

                })
                .catch(error => {
                    console.log("Error is: ", error);
                })
        } else {
            const id = idNote.attributes[2].nodeValue;
            heart = document.getElementById('empty-heart');
            heartImg.src = '/images/full-heart.png';
            heart.id = "full-heart";
            let intNumber = parseInt(number.innerText);
            intNumber++;
            number.innerText = intNumber;
            axios.post('https://project2ed.herokuapp.com/letters/add-favorite', { id })
                .then(response => {
                    console.log("You just created this character: ", response.data);

                })
                .catch(error => {
                    console.log("Error is: ", error);
                })
        }

    }

    function postVote(event) {
        event.preventDefault();
        let vote = document.getElementById('vote-button');
        let number = document.getElementById('votes-number');
        const id = idNote.attributes[2].nodeValue;

        axios.post('https://project2ed.herokuapp.com/letters/add-vote', { id })
            .then(response => {
                number.innerText = response.data;
                vote.style.visibility = 'hidden';
            })
            .catch(error => {
                console.log("Error is: ", error);
            })

    }

    function addComment(event) {
        event.preventDefault();
        let comment = document.getElementById('comment-button');
        let commentInput = document.getElementById('comment-text');
        const text = commentInput.value;
        const id = idNote.attributes[2].nodeValue;

        axios.post(`https://project2ed.herokuapp.com/letters/${id}/comment`, {text})
            .then(response => {
                console.log('Data '+ response.data);
                let comments = document.getElementById('ajax-comments');
                let commentText = document.createElement('p');
                commentText.innerText = response.data[0] + ' : ' + response.data[1];
                comments.appendChild(commentText);
                commentInput.value = '';
            })
            .catch(error => {
                console.log("Error is: ", error);
            })

    }
};


window.addEventListener('load', main);
