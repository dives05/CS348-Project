import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main',
  standalone: true,
  styleUrl: './main.css',
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './main.html',
})
export class MainComponent {}
