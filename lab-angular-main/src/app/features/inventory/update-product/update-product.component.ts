import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/core/data.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  updateProductForm: FormGroup;
  errorMessage: string | null = null;
  categories: string[] = ['Electronics', 'Clothing', 'Books', 'SkinCare', 'Health', 'Sports', 'Stationary'];
  productId: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    this.updateProductForm = this.fb.group({
      id: [this.productId],
      name: ['', Validators.required],
      description: ['', Validators.required],
      manufacturer: ['', Validators.required],
      manufacturingDate: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1), Validators.max(1000)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      supplierName: [''],
      supplierContact: [''] 
    });
  }

  ngOnInit() {
    this.dataService.getProductById(this.productId).subscribe({
      next: (product) => {
        this.updateProductForm.patchValue({
          id: product.id,
          name: product.name,
          description: product.description,
          manufacturer: product.manufacturer,
          manufacturingDate: product.manufacturingDate,
          price: product.price,
          quantity: product.quantity,
          category: product.category,
          supplierName: product.supplier?.name || '', // Patch supplier name
          supplierContact: product.supplier?.contact || '' // Patch supplier contact
        });
      },
      error: (err) => this.errorMessage = err.message
    });
  }

  onSubmit(): void {
    if (this.updateProductForm.valid) {
      const product = {
        id: this.productId,
        name: this.updateProductForm.get('name')?.value,
        description: this.updateProductForm.get('description')?.value,
        manufacturer: this.updateProductForm.get('manufacturer')?.value,
        manufacturingDate: this.updateProductForm.get('manufacturingDate')?.value,
        price: this.updateProductForm.get('price')?.value,
        quantity: this.updateProductForm.get('quantity')?.value,
        category: this.updateProductForm.get('category')?.value,
        supplier: { // Add supplier object
          name: this.updateProductForm.get('supplierName')?.value,
          contact: this.updateProductForm.get('supplierContact')?.value
        }
      };
      this.dataService.updateProduct(product).subscribe({
        next: () => {
          alert('Product updated successfully');
          this.router.navigate(['/inventory']);
        },
        error: (err) => this.errorMessage = err.message
      });
    } else {
      this.errorMessage = 'Please fill all fields correctly.';
    }
  }
}