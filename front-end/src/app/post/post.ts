import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService, PostIF } from '../post.service';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-post',
  imports: [CommonModule, FormsModule],
  templateUrl: './post.html',
  styleUrl: './post.css'
})
export class Post {
  post: PostIF = {id: 0, title: "", content: '', username: ''};
  comments: any[] = [];
  newComment = '';
  newEdit = '';
  id = 0;

  constructor(private route: ActivatedRoute, private service: PostService, private router: Router, private http: HttpClient){
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.id = id;
    this.service.getPostById(id).subscribe(post => {
      this.post = post[0];
      this.getComments();
    });
  }

  back() {
    this.router.navigate(['']);
  }

  update() {
    this.http.put(`http://localhost:3000/posts/${this.post.id}`, {content: `<br /> <br />Edit: ${this.newEdit}`}).subscribe(()=>{
      this.service.getPostById(this.id).subscribe(post => {
        this.post = post[0];
        this.newEdit = '';
      });
    })
  }

  addComment() {
    console.log("Received add comment");
    if (this.newComment != '') {
      this.http.post('http://localhost:3000/comments', { name: this.newComment , postId: this.post.id}).subscribe(() => {
        this.getComments();
        this.newComment = '';
      });
    }
    return
  }

  getComments() {
    console.log("Received get comments");
    this.http.get<any[]>(`http://localhost:3000/comments/${this.post.id}`).subscribe(data => this.comments = data);
  }

  deleteComment(id: number) {
    this.http.delete(`http://localhost:3000/comments/${id}`).subscribe(() => {
      this.getComments();
    })
  }
}
