import * as React from "react";
import { ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef(({ className, value, onChange, children, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract options from children
  const options = React.Children.map(children, (child) => ({
    value: child.props.value,
    label: child.props.children,
  })) || [];

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange?.({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        ref={ref}
        {...props}
      >
        <span>{selectedOption?.label || "Select..."}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
              onClick={() => handleSelect(option.value)}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="h-4 w-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
Select.displayName = "Select";

// Autocomplete component for the keyword input
const Autocomplete = React.forwardRef(
  (
    {
      className,
      suggestions = [],
      onSuggestionClick,
      onChange,
      isLoading,
      ...props
    },
    ref
  ) => {
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(props.value || "");
    const containerRef = React.useRef(null);

    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    React.useEffect(() => {
      if (props.value !== undefined) {
        setInputValue(props.value);
      }
    }, [props.value]);

    const handleInputChange = (e) => {
      const value = e.target.value;
      setInputValue(value);
      onChange?.(value);
      setShowSuggestions(true);
    };

    const handleSuggestionClick = (suggestion) => {
      setInputValue(suggestion);
      onChange?.(suggestion);
      onSuggestionClick?.(suggestion);
      setShowSuggestions(false);
    };

    const handleClear = () => {
      setInputValue("");
      onChange?.("");
      setShowSuggestions(false);
    };

    return (
      <div ref={containerRef} className="relative">
        <div className="relative">
          <input
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16",
              className
            )}
            ref={ref}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            {...props}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : showSuggestions && suggestions.length > 0 ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
        {showSuggestions && isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md p-3 text-sm text-muted-foreground">
            Loading suggestions...
          </div>
        )}
      </div>
    );
  }
);
Autocomplete.displayName = "Autocomplete";

export { Select, Autocomplete };
