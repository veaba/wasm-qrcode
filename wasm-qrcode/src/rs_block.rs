pub struct Tweet {
    pub username: String,
}

impl Tweet {
    pub fn get_name(&self) -> String {
        format!("{}", self.username)
    }
}
