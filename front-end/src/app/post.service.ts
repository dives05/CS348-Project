import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PostIF {
  id: number;
  title: string;
  content: string;
  username: string;
}

@Injectable({providedIn: 'root'})
export class PostService {
private apiUrl = 'http://localhost:3000/posts'; // your backend address

  constructor(private http: HttpClient) {}

  // Get a single post by its ID
  getPostById(id: number): Observable<PostIF[]> {
    const data = this.http.get<PostIF[]>(`${this.apiUrl}/post/${id}`);
    console.log(data);
    return data;
  }

  createPost(title: string, content: string, username: string) {
    console.log("Received");
    return this.http.post('http://localhost:3000/posts', { title: title , content: content, username: username});
  }

  search(name: string) {
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params: { q: name } });
  }
}