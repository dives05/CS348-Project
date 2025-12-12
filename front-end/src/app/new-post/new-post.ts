import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../post.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-post',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './new-post.html',
  styleUrl: './new-post.css'
})
export class NewPost {
  postForm: FormGroup;

  constructor(private fb: FormBuilder, private service: PostService, private router: Router){
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      username: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.postForm.valid) {
      console.log(this.postForm.value.title);

      const title = this.postForm.value.title;
      const content = this.postForm.value.content;
      const username = this.postForm.value.username;

      this.service.createPost(title, content, username).subscribe();

      this.postForm.reset({
        title: '',
        content: '',
        username: ''
      });

      this.router.navigate(['']);
    }
  }

  back() {
    this.router.navigate(['']);
  }
}
