import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/core/data.service';
import { Product } from 'src/app/shared/models/product.mode'; // Fixed typo in import
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  errorMessage: string | null = null;
  newRating: number = 0;
  newReview: string = '';
  userId: number = 0;
  currentUser: any = {}; 
  editRatingIndex: number | null = null; 

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.userId = this.getCurrentUserId();
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}'); // Get user details
    this.dataService.getProductById(id).subscribe({
      next: (product: Product) => {
        this.product = {
          ...product,
          availabilityStatus: this.getAvailabilityStatus(product.quantity) || 'Out of Stock'
        };
      },
      error: (err: Error) => this.errorMessage = err.message
    });
  }

  getCurrentUserId(): number {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 0;
  }

  getAvailabilityStatus(quantity: number): string {
    if (quantity > 10) return 'In Stock';
    if (quantity > 0) return 'Low Stock';
    return 'Out of Stock';
  }

  submitRating(): void {
    if (!this.product) return;

    const userRating = this.product.ratings?.find(r => r.userId === this.userId);
    if (userRating && this.editRatingIndex === null) {
      this.errorMessage = 'You have already rated this product. Use the edit option to modify your rating.';
      // Disable form interaction when duplicate is detected
      this.newRating = 0;
      this.newReview = '';
      return;
    }

    if (this.newRating >= 1 && this.newRating <= 5 && this.newReview && this.product) {
      const ratingObj = { rating: this.newRating, review: this.newReview, userId: this.userId };
      if (this.editRatingIndex !== null) {
        // Edit existing rating
        this.product.ratings![this.editRatingIndex] = ratingObj;
        this.editRatingIndex = null; // Reset edit mode
      } else {
        // Add new rating (if no duplicate)
        this.product.ratings = this.product.ratings || [];
        this.product.ratings.push(ratingObj);
      }
      this.dataService.updateProduct(this.product).subscribe({
        next: () => {
          this.newRating = 0;
          this.newReview = '';
          this.errorMessage = null;
          // Refresh the component to reflect changes
          this.ngOnInit();
        },
        error: (err: Error) => this.errorMessage = err.message
      });
    } else {
      this.errorMessage = 'Please select a rating (1-5) and provide a review.';
    }
  }

  getAverageRating(): number {
    if (!this.product?.ratings?.length) return 0; // Handle empty or undefined ratings
    const sum = this.product.ratings.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / this.product.ratings.length).toFixed(1)); // Ensure one decimal place
  }

  getUserName(userId: number): string {
    // Use firstName from localStorage for simplicity
    const users = JSON.parse(localStorage.getItem('user') || '{}');
    return users.firstName || `User ${userId}`; // Fallback to userId if name not available
  }

  startEditRating(index: number): void {
    if (!this.product?.ratings) return;
    const rating = this.product.ratings[index];
    if (rating.userId === this.userId) {
      this.editRatingIndex = index;
      this.newRating = rating.rating;
      this.newReview = rating.review;
      this.errorMessage = null; // Clear error when starting edit
    } else {
      this.errorMessage = 'You can only edit your own rating.';
    }
  }

  getAvailabilityClass(): string {
    return this.product?.availabilityStatus?.toLowerCase().replace(' ', '-') || 'out-of-stock';
  }
}