import React, { useEffect, useState } from "react";
import socketIO from "socket.io-client";
import { useParams } from "react-router-dom";

const socket = socketIO.connect("http://localhost:4000");

const Comments = () => {
  const { category, id } = useParams();
  const [comment, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    socket.on("comments", (data) => setCommentList(data));
  }, []);

  useEffect(() => {
    socket.emit("fetchComments", { category, id });
  }, [category, id]);

  const addComment = (e) => {
    e.preventDefault();
    socket.emit("addComment", {
      comment,
      category,
      id,
      userId: localStorage.getItem("userId"),
    });
    setComment("");
  };
  return (
    <div className="comments__container">
      <form className="comment__form" onSubmit={addComment}>
        <label className="comment__form">Adicionar comentário</label>
        <textarea
          placeholder="Digite seu comentário..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          row={5}
          id="comment"
          name="comment"
        ></textarea>
        <button className="commentBtn">Adicionar Comentário</button>
      </form>
      <div className="comments__section">
        <h2>Comentários existentes</h2>
        {commentList.map((comment) => (
          <div key={comment.id}>
            <p>
              <span style={{ fontWeight: "bold" }}>{comment.text}</span> by{" "}
              {comment.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
