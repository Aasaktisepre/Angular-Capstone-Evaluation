import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'src/app/shared/models/user.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  showAdminPin: boolean = false;
  isEmailDuplicate: boolean = false; // New flag to track duplicate email

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      location: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      role: ['user', Validators.required],
      adminPin: ['']
    });
  }

  ngOnInit(): void {
    this.registerForm.get('email')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(email => {
      if (email && this.registerForm.get('email')?.valid) {
        this.authService.checkDuplicateEmail(email).subscribe({
          next: ({ isDuplicate }) => {
            if (isDuplicate) {
              this.isEmailDuplicate = true; // Set flag
              alert('This email is already registered.'); // Show alert
            } else {
              this.isEmailDuplicate = false; // Clear flag
            }
          },
          error: (err) => {
            this.errorMessage = err.message; // Keep errorMessage for API errors
          }
        });
      } else {
        this.isEmailDuplicate = false; // Clear flag if email is invalid or empty
      }
    });
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      // Prevent submission if email is a duplicate
      if (this.isEmailDuplicate) {
        alert('This email is already registered.'); // Re-alert on submission
        return;
      }

      const user: User = this.registerForm.value;
      if (user.role === 'admin' && !user.adminPin) {
        this.errorMessage = 'Admin pin is required.';
        return;
      }
      this.authService.register(user).subscribe({
        next: (response) => {
          this.errorMessage = null;
          alert('Registration successful');
          this.router.navigate(['/auth/sign-in']);
        },
        error: (err) => {
          this.errorMessage = err.message;
        }
      });
    } else {
      this.errorMessage = 'Please fill all fields correctly.';
    }
  }

  onRoleChange(event: any) {
    this.showAdminPin = event.target.value === 'admin';
    if (!this.showAdminPin) {
      this.registerForm.get('adminPin')?.setValue('');
    }
  }
}