// Handle Add or Remove Likes for the user

$(".button-action").on("click", async function (e) {
  e.preventDefault();
  const $this = $(this);
  let msg_id = $this.attr("id");
  if ($this.hasClass("add-like")) {
    const new_like = await axios.post(`/users/add_like/${msg_id}`, {
      action: "add",
    });

    if (new_like.data.result == "add_pass") {
      $this.toggleClass("add-like remove-like");
      $(`.${msg_id}-icon_likes`).toggleClass("fa-heart  fa-thumbs-up");
      $(`#${msg_id}`).toggleClass("btn-primary  btn-secondary");
    }
  } else {
    const new_like = await axios.post(`/users/add_like/${msg_id}`, {
      action: "remove",
    });

    if (new_like.data.result == "remove_pass") {
      $this.toggleClass("remove-like add-like");
      $(`.${msg_id}-icon_likes`).toggleClass("fa-thumbs-up fa-heart");
      $(`#${msg_id}`).toggleClass("btn-secondary btn-primary");
    }
  }
});
