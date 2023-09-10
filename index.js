let commentId = 1;

class CommentObject {
  constructor(content, createdAt, id, replies, score, user){
    this.content = content;
    this.createdAt = createdAt;
    this.id = id;
    this.replies = replies;
    this.score = score;
    this.user = user;
  }
}

class ReplyObject {
  constructor(content, createdAt, id, replyingTo, score, user){
    this.content = content;
    this.createdAt = createdAt;
    this.id = id;
    this.replyingTo = replyingTo;
    this.score = score;
    this.user = user;
  }
}

async function getData(){
  const response = await fetch("./data.json");
  const userData = getDataFromLocalStorage() || await response.json();
  saveDataToLocalStorage(userData);
  renderPage(userData);
  modLikeCount();
  comment(userData);
  replyComment(userData);
  editBtnsfunc(userData);
  deleteBtnsFunc(userData);
}

function saveDataToLocalStorage(data){
  localStorage.setItem('data', JSON.stringify(data));
}

function getDataFromLocalStorage(){
  return JSON.parse(localStorage.getItem('data'));
}

function modLikeCount(){
  const addLikeBtns = document.querySelectorAll('.add-like-btn');
  const removeLikeBtns = document.querySelectorAll('.remove-like-btn');
  const addLikeBtnsBtm = document.querySelectorAll('.add-like-btn-btm');
  const removeLikeBtnsBtm = document.querySelectorAll('.remove-like-btn-btm');

  addLikeBtns.forEach((addLikeBtn) => {
    addLikeBtn.addEventListener('click', (e) => {
      const likeCounts = e.target.parentElement.parentElement.querySelectorAll('.like-count');

      const check = likeCheck(likeCounts, 'add');

      if(check){
        likeCounts.forEach((likeCount) => {
          likeCount.textContent++;
          likeCount.classList.add('add');
          likeCount.classList.remove('remove')
        })
      }
    })
  })
  
  addLikeBtnsBtm.forEach((addLikeBtnBtm) => {
    addLikeBtnBtm.addEventListener('click', (e) => {
      const likeCounts = e.target.parentElement.parentElement.parentElement.parentElement
      .querySelectorAll('.like-count');

      const check = likeCheck(likeCounts, 'add');

      if(check){
        likeCounts.forEach((likeCount) => {
          likeCount.textContent++;
          likeCount.classList.add('add');
          likeCount.classList.remove('remove');
        })
      }
    })
  })
  
  removeLikeBtnsBtm.forEach((removeLikeBtnBtm) => {
    removeLikeBtnBtm.addEventListener('click', (e) => {
      const likeCounts = e.target.parentElement.parentElement.parentElement.parentElement
      .querySelectorAll('.like-count');

      const check = likeCheck(likeCounts, 'remove');

      if(check){
        likeCounts.forEach((likeCount) => {
          if(likeCount.textContent > 0){
            likeCount.textContent--;
            likeCount.classList.add('remove');
            likeCount.classList.remove('add');
          }
        })
      }
    })
  })

  removeLikeBtns.forEach((removeLikeBtn) => {
    removeLikeBtn.addEventListener('click', (e) => {
      const likeCounts = e.target.parentElement.parentElement
        .querySelectorAll('.like-count');
      
        const check = likeCheck(likeCounts, 'remove');

        if(check){
          likeCounts.forEach((likeCount) => {
            if(likeCount.textContent > 0){
              likeCount.textContent--;
              likeCount.classList.add('remove');
              likeCount.classList.remove('add');
            }
          })
        }
    })
  })
}

function likeCheck(likeCounts, classContain){
  let check = false;

  likeCounts.forEach((likeCount) => {
    if(!likeCount.classList.contains(classContain)){
      check = true;
    } else {
      check = false;
    }
  })

  console.log(check);
  return check;
}

function replyComment(data){
  const replyBtns = document.querySelectorAll('.reply-btn');
  
  replyBtns.forEach((replyBtn) => {
    replyBtn.addEventListener('click', (e) => {
      const tag = e.target.parentElement.parentElement.querySelector('.commentator-username').textContent;
      const mainComment = e.target.parentElement.parentElement.parentElement.parentElement.id;
      const replyingBtn = document.querySelector('.send-reply-btn');
      const sendBtn = document.querySelector('.send-btn');
      const editBtn = document.querySelector('#edit-btn');

      document.querySelector('.input-field').setAttribute('placeholder', `Replying to @${tag.trim()}... 
      Press the ESC button to cancel.`);

      scrollToInput();
      escBtn();

      sendBtn.style.display = 'none';
      replyingBtn.style.display = 'block';
      editBtn.style.display = 'none';

      replyingBtn.addEventListener('click', () => {
        const reply = document.querySelector('.input-field').value;
        if(reply){
          
          data.comments[mainComment].replies.push(new ReplyObject(
            reply, 'Just Now', commentId, tag, 0, {image: {png: data.currentUser.image.png}, username: data.currentUser.username}
          ));

          commentId++;
          saveDataToLocalStorage(data);
          renderPage(data);
          defaultState();
          modLikeCount();
        }
      
      })
    })
  })
}

function comment(data){
  const sendBtn = document.querySelector('.send-btn');
  sendBtn.addEventListener('click', () => {
    let comment = document.querySelector('.input-field').value;
    if(comment){

      data.comments.push(
        new CommentObject(comment, 'Just Now', commentId, [], 0, {username: data.currentUser.username, image: {png: data.currentUser.image.png} })
      );
      
      commentId++;
      saveDataToLocalStorage(data);
      renderPage(data);
      document.querySelector('.input-field').value = '';
      modLikeCount();
      defaultState();
    }
  })
}

function renderPage(data){
  let renderHTML = '';
  for(let i = 0; i < data.comments.length; i++){
    const comment = data.comments[i];

    if(comment.user.username === data.currentUser.username){
      renderHTML += `
        <div id="${i}">
        <div class="comment-div" id="${comment.id}">
        <div class="like-div">
          <button class="add-like-btn">
            +
          </button>
          <p class="like-count">${comment.score}</p>
          <button class="remove-like-btn">
            -
          </button>
        </div>

        <div class="comment-content">
          <div class="commentator-info current-user">
            <img src="${comment.user.image.png}" class="commentator-image" alt="image">

            <div class="commentator-username current-user-name">
              ${comment.user.username} <span class="you-text"> you </span>
            </div>

            <div class="comment-date">
              ${comment.createdAt}
            </div>

            <button class="delete-btn">
              <img alt="imagedelete" src="./images/icon-delete.svg">
              Delete
            </button>

            <button class="edit-btn">
              <img alt="imagereply" src="./images/icon-edit.svg">
              Edit
            </button>
          </div>

          <div class="comment">${comment.content}</div>

          <div class="bottom-div-current-user">
            <div class="like-div-bottom">
              <button class="add-like-btn-btm">
                +
              </button>
              <p class="like-count">${comment.score}</p>
              <button class="remove-like-btn-btm">
                -
              </button>
            </div>

            <button class="delete-btn-bottom">
              <img alt="imagereply" src="./images/icon-delete.svg">
              Delete
            </button>

            <button class="edit-btn-bottom">
              <img alt="image" src="./images/icon-edit.svg">
              Edit
            </button>
          </div>
          
        </div>
      </div>
      `;
    } else {
      renderHTML += `
      <div id="${i}">
        <div class="comment-div" id="${comment.id}">
        <div class="like-div">
          <button class="add-like-btn">
            +
          </button>
          <p class="like-count">${comment.score}</p>
          <button class="remove-like-btn">
            -
          </button>
        </div>

        <div class="comment-content">
          <div class="commentator-info">
            <img src="${comment.user.image.png}" class="commentator-image" alt="image">

            <div class="commentator-username">
            ${comment.user.username}
            </div>

            <div class="comment-date">
              ${comment.createdAt}
            </div>

            <button class="reply-btn-top reply-btn">
              <img alt="imagereply" src="./images/icon-reply.svg">
              Reply
            </button>
          </div>

          <div class="comment">
            ${comment.content}
          </div>

          <div class="bottom-div">
            <div class="like-div-bottom">
              <button class="add-like-btn-btm">
                +
              </button>
              <p class="like-count">${comment.score}</p>
              <button class="remove-like-btn-btm">
                -
              </button>
            </div>

            <button class="reply-btn-bottom reply-btn">
              <img alt="imagereply" src="./images/icon-reply.svg">
              Reply
            </button>
          </div>
          

        </div>
    </div>
      `;
    }

    if(commentId === comment.id){
      commentId++;
    }

    if(!comment.replies.length){
      renderHTML += `</div>`;
    } else {
      for(let i = 0; i < comment.replies.length; i++){
        const reply = comment.replies[i];
        if(reply.user.username === data.currentUser.username){
          renderHTML += `
            <div class="comment-div reply" id="${reply.id}">
            <div class="like-div">
              <button class="add-like-btn">
                +
              </button>
              <p class="like-count">${reply.score}</p>
              <button class="remove-like-btn">
                -
              </button>
            </div>
    
            <div class="comment-content">
              <div class="commentator-info current-user">
                <img src="${reply.user.image.png}" class="commentator-image" alt="image">
    
                <div class="commentator-username current-user-name">
                  ${reply.user.username} <span class="you-text"> you </span>
                </div>
    
                <div class="comment-date">
                  ${reply.createdAt}
                </div>
    
                <button class="delete-btn">
                  <img alt="imagedelete" src="./images/icon-delete.svg">
                  Delete
                </button>
    
                <button class="edit-btn">
                  <img alt="imagereply" src="./images/icon-edit.svg">
                  Edit
                </button>
              </div>
    
              <div class="comment">
                <span class="tag">@${reply.replyingTo}</span> ${reply.content}
              </div>

              <div class="bottom-div-current-user">
                <div class="like-div-bottom">
                  <button class="add-like-btn-btm">
                    +
                  </button>
                  <p class="like-count">${reply.score}</p>
                  <button class="remove-like-btn-btm">
                    -
                  </button>
                </div>

                <button class="delete-btn-bottom">
                  <img alt="imagereply" src="./images/icon-delete.svg">
                  Delete
                </button>

                <button class="edit-btn-bottom">
                  <img alt="image" src="./images/icon-edit.svg">
                  Edit
                </button>
              </div>
              
            </div>
          </div>
          `;
        } else {
          renderHTML += `
            <div class="comment-div reply" id="${reply.id}">
            <div class="like-div">
              <button class="add-like-btn">
                +
              </button>
              <p class="like-count">${reply.score}</p>
              <button class="remove-like-btn">
                -
              </button>
            </div>
    
            <div class="comment-content">
              <div class="commentator-info">
                <img src="${reply.user.image.png}" class="commentator-image" alt="image">
    
                <div class="commentator-username">
                  ${reply.user.username}
                </div>
    
                <div class="comment-date">
                  ${reply.createdAt}
                </div>
    
                <button class="reply-btn-top reply-btn">
                  <img alt="imagereply" src="./images/icon-reply.svg">
                  Reply
                </button>
              </div>
    
              <div class="comment">
                ${reply.content}
              </div>

              <div class="bottom-div">
                <div class="like-div-bottom">
                  <button class="add-like-btn-btm">
                    +
                  </button>
                  <p class="like-count">${reply.score}</p>
                  <button class="remove-like-btn-btm">
                    -
                  </button>
                </div>

                <button class="reply-btn-bottom reply-btn">
                  <img alt="imagereply" src="./images/icon-reply.svg">
                  Reply
                </button>
              </div>
              
            </div>
          </div>
          `;
        }

        if(commentId === reply.id){
          commentId++;
        }
      }
      renderHTML += `</div>`
    }
  }

  document.querySelector('.main-comment-div').innerHTML = renderHTML;
}

function defaultState(){
  document.querySelector('.input-field').value = '';
  document.querySelector('.input-field').setAttribute('placeholder', `Add a comment...`);
  document.querySelector('.send-btn').style.display = 'block';
  document.querySelector('.send-reply-btn').style.display = 'none';
  document.querySelector('#edit-btn').style.display ='none';
  document.querySelector('.modal').style.display = 'none';
  document.querySelector('body').style.overflow = 'visible';
  location.reload();
}

function escBtn(){
  window.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      defaultState();
    }
  })
}

function editBtnsfunc(data){
  const editBtnsTop = document.querySelectorAll('.edit-btn');
  const editBtnsBtm = document.querySelectorAll('.edit-btn-bottom');
  
  editBtnsTop.forEach((editBtnTop) => {
    editBtnTop.addEventListener('click', (e) => {
      getComment(e, data, 'Editing...');
      document.querySelector('.send-btn').style.display ='none';
      document.querySelector('#edit-btn').style.display ='block';
      document.querySelector('.send-reply-btn').style.display ='none';
    })
  })
  
  editBtnsBtm.forEach((editBtnBtm) => {
    editBtnBtm.addEventListener('click', (e) => {
      getComment(e, data, 'Editing...');
      document.querySelector('.send-btn').style.display ='none';
      document.querySelector('#edit-btn').style.display ='block';
      document.querySelector('.send-reply-btn').style.display ='none';
    })
  })
}

function getComment(e, data, placeholder){
  const mainComment = e.target.parentElement.parentElement.parentElement.parentElement;
  const currentComment = e.target.parentElement.parentElement.parentElement;
  const comment = data.comments[mainComment.id];
  const replies = data.comments[mainComment.id].replies || '' ;
  
  document.querySelector('.input-field').setAttribute('placeholder', `${placeholder}`);
  
  if(parseInt(currentComment.id) === comment.id){
    editComment(comment, data);
  } else {
    for(let i = 0; i < replies.length; i++){
      const reply = replies[i];

      if(reply.id === parseInt(currentComment.id)){
        editComment(reply, data);
        break;
      }
    }
  }


  scrollToInput();
  escBtn();
}

function deleteComment(e, data, placeholder){
  const mainComment = e.target.parentElement.parentElement.parentElement.parentElement;
  const currentComment = e.target.parentElement.parentElement.parentElement;
  const comment = data.comments[mainComment.id];
  const replies = data.comments[mainComment.id].replies || '' ;
  
  document.querySelector('.input-field').setAttribute('placeholder', `${placeholder}`);
  
  document.querySelector('.modal').style.display = 'flex';
  document.querySelector('body').style.overflow = 'hidden';

  document.querySelector('.modal-cancel').addEventListener('click', defaultState);

  document.querySelector('.modal-delete').addEventListener('click', () => {
    if(parseInt(currentComment.id) === comment.id){
      data.comments.splice(mainComment.id, 1);
      saveDataToLocalStorage(data);
      renderPage(data);
      defaultState();
    } else {
      for(let i = 0; i < replies.length; i++){
        const reply = replies[i];
  
        if(reply.id === parseInt(currentComment.id)){
          replies.splice(i, 1);
          saveDataToLocalStorage(data);
          renderPage(data);
          defaultState();
          break;
        }
      }
    } 
  })
}

function editComment(item, data){
  const editBtn = document.querySelector('#edit-btn');

  editBtn.addEventListener('click', () => {
    const edit = document.querySelector('.input-field').value;

    if(edit){
      item.content = edit;
      saveDataToLocalStorage(data);
      renderPage(data);
      defaultState();
      modLikeCount();
    }
  })
}

function scrollToInput(){
  const inputLocation = document.querySelector('.input-comment-div-small-screen').getBoundingClientRect().y;

  if(window.scrollY < inputLocation + 171){
    window.scrollTo(0, inputLocation + 190);
  };
}

function deleteBtnsFunc(data){
  const deleteBtnsTop = document.querySelectorAll('.delete-btn');
  const deleteBtnsBottom = document.querySelectorAll('.delete-btn-bottom');

  deleteBtnsTop.forEach((deleteBtnTop) => {
    deleteBtnTop.addEventListener('click', (e) => {
      deleteComment(e, data, 'Deleting...');
    })
  });

  deleteBtnsBottom.forEach((deleteBtnBottom) => {
    deleteBtnBottom.addEventListener('click', (e) => {
      deleteComment(e, data, 'Deleting...');
    })
  })
}

getData();
