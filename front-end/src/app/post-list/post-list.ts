import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { PostService } from '../post.service';

@Component({
  selector: 'app-main',
  standalone: true,
  styleUrl: './post-list.css',
  imports: [CommonModule, FormsModule],
  templateUrl: './post-list.html',
})
export class PostList {
  posts: any[] = [];
  comments: any[] = [];
  searchName = '';
  lastSearch = '';
  private apiURL = 'http://localhost:3000/items';
  private apiUrl = 'http://localhost:3000/posts';

  constructor(private http: HttpClient, private router: Router, private service: PostService) {
    this.loadPosts();
  }

  openPost(id: number) {
    this.router.navigate(['/post', id])
  }

  addPost() {
    this.router.navigate(['/newPost'])
  }

  loadPosts() {
    this.http.get<any[]>(this.apiUrl)
      .subscribe(data => this.posts = data);
    // console.log(this.posts)
  }

  deletePost(id: number, event: MouseEvent) {
    event.stopPropagation();
    this.http.delete(`${this.apiUrl}/${id}`)
    .subscribe(() => {
      if(this.lastSearch != '') {
        this.searchName = this.lastSearch;
        this.search()
      }
      else {
        this.loadPosts();
      }
      });
    this.http.delete(`${this.apiUrl}/comments/${id}`).subscribe();
  }

  search() {
    if (this.searchName == '') {
      this.lastSearch = '';
      this.loadPosts();
      return;
    }
    this.service.search(this.searchName).subscribe(data => this.posts = data);
    this.lastSearch = this.searchName;
    this.searchName = '';
  }
}
