import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from './button';

export const Card = ({ className, children, ...props }: HTMLMotionProps<"div">) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className={cn("rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-950 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-50 dark:hover:shadow-xl dark:hover:shadow-black/20", className)}
        {...props}
    >
        {children}
    </motion.div>
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-2xl font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-50", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("p-6 pt-0 text-gray-700 dark:text-gray-300", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex items-center p-6 pt-0 text-gray-700 dark:text-gray-300", className)} {...props} />
);
