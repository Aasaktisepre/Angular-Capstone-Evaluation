import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/core/data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  addProductForm: FormGroup;
  errorMessage: string | null = null;
  categories: string[] = ['Electronics', 'Clothing', 'Books', 'SkinCare', 'Health', 'Sports', 'Stationary'];
  userRole: string = 'user';

  constructor(private fb: FormBuilder, private dataService: DataService, private router: Router, private authService: AuthService) {
    this.addProductForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      manufacturer: ['', Validators.required],
      manufacturingDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1), Validators.max(10000)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      supplierName: [''],
      supplierContact: ['']
    });
    // Ensure userRole is updated when the component loads
    this.userRole = this.authService.getUserRole() || 'user'; // Fallback to 'user' if undefined
  }

  onSubmit(): void {
    if (this.addProductForm.valid) {
      if (this.userRole === 'user') {
        alert('Only admin have the access');
        return;
      }
      const pin = prompt('Enter admin pin (4 digits):');
      if (pin && this.authService.verifyAdminPin(pin)) {
        const product = {
          name: this.addProductForm.get('name')?.value,
          description: this.addProductForm.get('description')?.value,
          manufacturer: this.addProductForm.get('manufacturer')?.value,
          manufacturingDate: this.addProductForm.get('manufacturingDate')?.value,
          price: this.addProductForm.get('price')?.value,
          quantity: this.addProductForm.get('quantity')?.value,
          category: this.addProductForm.get('category')?.value,
          supplier: {
            name: this.addProductForm.get('supplierName')?.value,
            contact: this.addProductForm.get('supplierContact')?.value
          }
        };
        this.dataService.addProduct(product).subscribe({
          next: () => {
            alert('Product added successfully');
            this.router.navigate(['/inventory']);
          },
          error: (err) => this.errorMessage = err.message
        });
      } else {
        alert('Invalid admin pin.');
      }
    } else {
      this.errorMessage = 'Please fill all fields correctly.';
    }
  }
}