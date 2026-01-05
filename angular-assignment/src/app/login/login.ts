import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

//import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loginError: string = '';

  constructor(
    private fb: FormBuilder,
    //private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // convenience getter for easy access to form controls
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginError = '';

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    // call login API through AuthService
    /*this.authService.login(email, password).subscribe({
      next: (res) => {
        console.log('Login success:', res);
        this.router.navigate(['/dashboard']); // redirect after login
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loginError = 'Invalid email or password';
      },
    });*/
  }
}
