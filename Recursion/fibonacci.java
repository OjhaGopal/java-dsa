package Recursion;

public class fibonacci {

    public static void main(String args[]) {
        int n = 10; //

        System.out.println(fibo(n));

    }

    public static int fibo(int n) {

        if (n == 0 || n == 1) {
            return n;
        }

        int temp = fibo(n - 1);
        int temp2 = fibo(n - 2);

        return temp + temp2;
    }
}

// This code calculates the nth Fibonacci number using recursion.
// The Fibonacci sequence is defined as:
// F(0) = 0, F(1) = 1
// F(n) = F(n-1) + F(n-2) for n > 1
// The program defines a method `fibo` that takes an integer `n` and returns the
// nth Fibonacci number.The position in the Fibonacci sequence to calculate
// In this case, it calculates the 10th Fibonacci number and prints the result.
// The `fibo` method checks if `n` is 0 or 1, returning `n` directly in those
// cases. For other values of `n`, it recursively calls itself to compute the
// sum of the two preceding Fibonacci
// numbers, `fibo(n-1)` and `fibo(n-2)`, and returns that sum.
// The output of this program will be 55, which is the 10th Fibonacci number.
// The time complexity of this recursive approach is O(2^n) due to the
// exponential growth of recursive calls.