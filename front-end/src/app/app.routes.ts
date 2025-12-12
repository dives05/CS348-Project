import { Routes } from '@angular/router';
import { MainComponent } from './main/main';
import { Post } from './post/post';
import { PostList } from './post-list/post-list';
import { NewPost } from './new-post/new-post';

export const routes: Routes = [
    {
        path: '',
        component: PostList
    },
    {
        path: 'post/:id',
        component: Post
    },
    {
        path: 'newPost',
        component: NewPost
    }
];
